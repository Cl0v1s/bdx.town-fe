/* eslint sort-keys: "error" */
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { createSelector } from 'reselect';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';
import semverParse from 'semver/functions/parse';

import { custom } from 'soapbox/custom';

import type { Instance } from 'soapbox/types/entities';

/** Import custom overrides, if exists */
const overrides = custom('features');

/** Truthy array convenience function */
const any = (arr: Array<any>): boolean => arr.some(Boolean);

/**
 * Mastodon, the software upon which this is all based.
 * @see {@link https://joinmastodon.org/}
 */
export const MASTODON = 'Mastodon';

/**
 * Pleroma, a feature-rich alternative written in Elixir.
 * @see {@link https://pleroma.social/}
 */
export const PLEROMA = 'Pleroma';

/**
 * Akkoma, a cooler fork of Pleroma
 * @see {@link https://docs.akkoma.dev/stable/}
 */
export const AKKOMA = 'Akkoma';

/**
 * Mitra, a Rust backend with deep Ethereum integrations.
 * @see {@link https://codeberg.org/silverpill/mitra}
 */
export const MITRA = 'Mitra';

/**
 * Pixelfed, a federated image sharing platform.
 * @see {@link https://pixelfed.org/}
 */
export const PIXELFED = 'Pixelfed';

/**
 * Truth Social, the Mastodon fork powering truthsocial.com
 * @see {@link https://help.truthsocial.com/open-source}
 */
export const TRUTHSOCIAL = 'TruthSocial';

/**
 * Soapbox BE, the recommended Pleroma fork for Soapbox.
 * @see {@link https://gitlab.com/soapbox-pub/soapbox-be}
 */
export const SOAPBOX = 'soapbox';

/**
 * glitch-soc, fork of Mastodon with a number of experimental features.
 * @see {@link https://glitch-soc.github.io/docs/}
 */
export const GLITCH = 'glitch';

/** Parse features for the given instance */
const getInstanceFeatures = (instance: Instance) => {
  const v = parseVersion(instance.version);
  const features = instance.pleroma.getIn(['metadata', 'features'], ImmutableList()) as ImmutableList<string>;
  const federation = instance.pleroma.getIn(['metadata', 'federation'], ImmutableMap()) as ImmutableMap<string, any>;
  return {
    /**
     * Can view and manage ActivityPub aliases through the API.
     * @see GET /api/pleroma/aliases
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountAliases: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * The accounts API allows an acct instead of an ID.
     * @see GET /api/v1/accounts/:acct_or_id
     */
    accountByUsername: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Ability to create accounts.
     * @see POST /api/v1/accounts
     */
    accountCreation: any([
      v.software === MASTODON,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),

    /**
     * Ability to pin other accounts on one's profile.
     * @see POST /api/v1/accounts/:id/pin
     * @see POST /api/v1/accounts/:id/unpin
     * @see GET  /api/v1/endorsements
     */
    accountEndorsements: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),

    /**
     * Ability to set one's location on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountLocation: any([
      (v.software === PLEROMA || v.software === AKKOMA) && v.build === SOAPBOX && gte(v.version, '2.4.50'),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Look up an account by the acct.
     * @see GET /api/v1/accounts/lookup
     */
    accountLookup: any([
      v.software === MASTODON && gte(v.compatVersion, '3.4.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Move followers to a different ActivityPub account.
     * @see POST /api/pleroma/move_account
     */
    accountMoving: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),

    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/accounts/:id/follow
     */
    accountNotifies: any([
      v.software === MASTODON && gte(v.compatVersion, '3.3.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/pleroma/accounts/:id/subscribe
     * @see POST /api/v1/pleroma/accounts/:id/unsubscribe
     */
    accountSubscriptions: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '1.0.0'),

    /**
     * Ability to set one's website on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountWebsite: v.software === TRUTHSOCIAL,

    /**
     * Can display announcements set by admins.
     * @see GET /api/v1/announcements
     * @see POST /api/v1/announcements/:id/dismiss
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcements: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.2.49'),
    ]),

    /**
     * Can emoji react to announcements set by admins.
     * @see PUT /api/v1/announcements/:id/reactions/:name
     * @see DELETE /api/v1/announcements/:id/reactions/:name
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcementsReactions: v.software === MASTODON && gte(v.compatVersion, '3.1.0'),

    /**
     * Pleroma backups.
     * @see GET /api/v1/pleroma/backups
     * @see POST /api/v1/pleroma/backups
     */
    backups: v.software === PLEROMA || v.software === AKKOMA,

    /**
     * Set your birthday and view upcoming birthdays.
     * @see GET /api/v1/pleroma/birthdays
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     */
    birthdays: (v.software === PLEROMA || v.software === AKKOMA) && v.build === SOAPBOX && gte(v.version, '2.4.50'),

    /** Whether people who blocked you are visible through the API. */
    blockersVisible: features.includes('blockers_visible'),

    /**
     * Can bookmark statuses.
     * @see POST /api/v1/statuses/:id/bookmark
     * @see GET /api/v1/bookmarks
     */
    bookmarks: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '0.9.9'),
      v.software === PIXELFED,
    ]),

    /**
     * Accounts can be marked as bots.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    bots: any([
      v.software === MASTODON,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),

    /**
     * Can display a timeline of a list of handpicked instaces statuses.
     * @see GET /api/v1/timelines/bubble
     */
    bubbleTimeline: any([
      v.software === AKKOMA,
    ]),

    /**
     * Pleroma chats API.
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/}
     */
    chats: (v.software === PLEROMA || features.includes('pleroma_chat_messages')) && gte(v.version, '2.1.0'),

    /**
     * Paginated chats API.
     * @see GET /api/v2/chats
     */
    chatsV2: (v.software === PLEROMA || features.includes('pleroma_chat_messages')) && gte(v.version, '2.3.0'),

    /**
     * Mastodon's newer solution for direct messaging.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/conversations/}
     */
    conversations: any([
      v.software === MASTODON && gte(v.compatVersion, '2.6.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '0.9.9'),
      v.software === PIXELFED,
    ]),

    /**
     * Legacy DMs timeline where messages are displayed chronologically without groupings.
     * @see GET /api/v1/timelines/direct
     */
    directTimeline: any([
      v.software === MASTODON && lt(v.compatVersion, '3.0.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '0.9.9'),
    ]),

    editStatuses: any([
      v.software === MASTODON && gte(v.version, '3.5.0'),
      features.includes('editing'),
    ]),

    /**
     * Soapbox email list.
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     * @see GET /api/v1/pleroma/admin/email_list/subscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/unsubscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/combined.csv
     */
    emailList: features.includes('email_list'),

    /**
     * Ability to embed posts on external sites.
     * @see GET /api/oembed
     */
    embeds: v.software === MASTODON,

    /**
     * Ability to add custom emoji reactions to a status.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     * @see GET /api/v1/pleroma/statuses/:id/reactions/:emoji?
     * @see DELETE /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiCustomReacts: v.software === AKKOMA && features.includes('custom_emoji_reactions'),

    /**
     * Ability to add emoji reactions to a status.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     * @see GET /api/v1/pleroma/statuses/:id/reactions/:emoji?
     * @see DELETE /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiReacts: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.0.0'),

    /**
     * The backend allows only RGI ("Recommended for General Interchange") emoji reactions.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiReactsRGI: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.2.49'),

    /**
     * Ability to address recipients of a status explicitly (with `to`).
     * @see POST /api/v1/statuses
     */
    explicitAddressing: any([
      // Keep as comment for the day mastodon will show things correctly
      // https://github.com/BDX-town/Mangane/issues/27
      // v.software === PLEROMA && gte(v.version, '1.0.0'),
      v.software === TRUTHSOCIAL,
    ]),

    /** Whether to allow exporting follows/blocks/mutes to CSV by paginating the API. */
    exportData: true,

    /** Whether the accounts who favourited or emoji-reacted to a status can be viewed through the API. */
    exposableReactions: any([
      v.software === MASTODON,
      v.software === TRUTHSOCIAL,
      features.includes('exposable_reactions'),
    ]),

    /**
     * Can see accounts' followers you know
     * @see GET /api/v1/accounts/familiar_followers
     */
    familiarFollowers: v.software === MASTODON && gte(v.version, '3.5.0'),

    /** Whether the instance federates. */
    federating: federation.get('enabled', true) === true, // Assume true unless explicitly false

    /** Whether or not to show the Feed Carousel for suggested Statuses */
    feedUserFiltering: v.software === TRUTHSOCIAL,

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/accounts/filters/}
     */
    filters: any([
      v.software === MASTODON && lt(v.compatVersion, '3.6.0'),
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),

    /**
     * Allows setting the focal point of a media attachment.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/media/}
     */
    focalPoint: v.software === MASTODON && gte(v.compatVersion, '2.3.0'),

    /**
     * Ability to lock accounts and manually approve followers.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    followRequests: any([
      v.software === MASTODON,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),

    /**
     * Can follow hashtag and show tags in home timeline
     * @see GET /api/v1/followed_tags
     */
    followTags: any([
      v.software === MASTODON && gte(v.compatVersion, '4.0.0'),
      v.software === AKKOMA,
      v.software === PLEROMA,
    ]),

    /**
     * Whether client settings can be retrieved from the API.
     * @see GET /api/pleroma/frontend_configurations
     */
    frontendConfigurations: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Can hide follows/followers lists and counts.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    hideNetwork: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Pleroma import API.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/pleroma/mutes_import
     */
    import: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Pleroma import endpoints.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/pleroma/mutes_import
     */
    importData: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.2.0'),

    /**
     * Can create, view, and manage lists.
     * @see {@link https://docs.joinmastodon.org/methods/timelines/lists/}
     * @see GET /api/v1/timelines/list/:list_id
     */
    lists: any([
      v.software === MASTODON && gte(v.compatVersion, '2.1.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '0.9.9'),
    ]),

    /**
     * Can set status visibility to local-only
     * @see {@link https://docs.akkoma.dev/stable/development/API/differences_in_mastoapi_responses/#statuses}
     */
    localOnlyPrivacy: v.software === AKKOMA,

    /**
     * Can perform moderation actions with account and reports.
     * @see {@link https://docs.joinmastodon.org/methods/admin/}
     * @see GET /api/v1/admin/reports
     * @see POST /api/v1/admin/reports/:report_id/resolve
     * @see POST /api/v1/admin/reports/:report_id/reopen
     * @see POST /api/v1/admin/accounts/:account_id/action
     * @see POST /api/v1/admin/accounts/:account_id/approve
     */
    mastodonAdmin: any([
      v.software === MASTODON && gte(v.compatVersion, '2.9.1'),
      (v.software === PLEROMA || v.software === AKKOMA) && v.build === SOAPBOX && gte(v.version, '2.4.50'),
    ]),

    /**
     * Can upload media attachments to statuses.
     * @see POST /api/v1/media
     * @see POST /api/v1/statuses
     */
    media: true,

    /**
     * Supports V2 media uploads.
     * @see POST /api/v2/media
     */
    mediaV2: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.3'),
      // Even though Pleroma supports these endpoints, it has disadvantages
      // (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.1.0'),
    ]),

    /**
     * Ability to hide notifications from people you don't follow.
     * @see PUT /api/pleroma/notification_settings
     */
    muteStrangers: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Add private notes to accounts.
     * @see POST /api/v1/accounts/:id/note
     * @see GET /api/v1/accounts/relationships
     */
    notes: any([
      v.software === MASTODON && gte(v.compatVersion, '3.2.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),
    ]),

    /**
     * Allows specifying notification types to include, rather than to exclude.
     * @see GET /api/v1/notifications
     */
    notificationsIncludeTypes: any([
      v.software === MASTODON && gte(v.compatVersion, '3.5.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),
    ]),

    /**
     * Supports pagination in threads.
     * @see GET /api/v1/statuses/:id/context/ancestors
     * @see GET /api/v1/statuses/:id/context/descendants
     */
    paginatedContext: v.software === TRUTHSOCIAL,

    /**
     * Require minimum password requirements.
     * - 8 characters
     * - 1 uppercase
     * - 1 lowercase
     */
    passwordRequirements: v.software === TRUTHSOCIAL,

    /**
     * Displays a form to follow a user when logged out.
     * @see POST /main/ostatus
     */
    pleromaRemoteFollow: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Can add polls to statuses.
     * @see POST /api/v1/statuses
     */
    polls: any([
      v.software === MASTODON && gte(v.version, '2.8.0'),
      (v.software === PLEROMA || v.software === AKKOMA),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Can set privacy scopes on statuses.
     * @see POST /api/v1/statuses
     */
    privacyScopes: v.software !== TRUTHSOCIAL,

    /**
     * A directory of discoverable profiles from the instance.
     * @see {@link https://docs.joinmastodon.org/methods/instance/directory/}
     */
    profileDirectory: any([
      v.software === MASTODON && gte(v.compatVersion, '3.0.0'),
      features.includes('profile_directory'),
    ]),

    /**
     * Ability to set custom profile fields.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    profileFields: any([
      v.software === MASTODON,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),



    /**
     * Can display a timeline of all known public statuses.
     * Local and Fediverse timelines both use this feature.
     * @see GET /api/v1/timelines/public
     */
    publicTimeline: any([
      v.software === MASTODON,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),



    /**
     * Ability to quote posts in statuses.
     * @see POST /api/v1/statuses
     */
    quotePosts: any([
      (v.software === PLEROMA || v.software === AKKOMA) && v.build === SOAPBOX && gte(v.version, '2.4.50'),
      features.includes('quote_posting'),
      instance.feature_quote === true,
    ]),

    /**
     * Interact with statuses from another instance while logged-out.
     * @see POST /api/v1/pleroma/remote_interaction
     */
    remoteInteractions: (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '2.4.50'),

    /**
     * Ability to remove an account from your followers.
     * @see POST /api/v1/accounts/:id/remove_from_followers
     */
    removeFromFollowers: any([
      v.software === MASTODON && gte(v.compatVersion, '3.5.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && v.build === SOAPBOX && gte(v.version, '2.4.50'),
    ]),

    reportMultipleStatuses: any([
      v.software === MASTODON,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),

    /**
     * Can request a password reset email through the API.
     * @see POST /auth/password
     */
    resetPassword: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Ability to post statuses in Markdown, BBCode, and HTML.
     * @see POST /api/v1/statuses
     */
    richText: any([
      v.software === MASTODON && v.build === GLITCH,
      (v.software === PLEROMA || v.software === AKKOMA),
    ]),

    /**
     * Can schedule statuses to be posted at a later time.
     * @see POST /api/v1/statuses
     * @see {@link https://docs.joinmastodon.org/methods/statuses/scheduled_statuses/}
     */
    scheduledStatuses: any([
      v.software === MASTODON && gte(v.version, '2.7.0'),
      // v.software === PLEROMA, disable for new as scheduled statuses on Pleroma doesnt work
      v.software === AKKOMA,
    ]),

    /**
     * List of OAuth scopes supported by both Soapbox and the backend.
     * @see POST /api/v1/apps
     * @see POST /oauth/token
     */
    scopes: (v.software === PLEROMA || v.software === AKKOMA) ? 'read write follow push admin' : 'read write follow push admin:read admin:write',

    /**
     * Ability to search statuses from the given account.
     * @see {@link https://docs.joinmastodon.org/methods/search/}
     * @see POST /api/v2/search
     */
    searchFromAccount: any([
      v.software === MASTODON && gte(v.version, '2.8.0'),
      (v.software === PLEROMA || v.software === AKKOMA) && gte(v.version, '1.0.0'),
    ]),

    /**
     * Ability to manage account security settings.
     * @see POST /api/pleroma/change_password
     * @see POST /api/pleroma/change_email
     * @see POST /api/pleroma/delete_account
     */
    security: any([
      (v.software === PLEROMA || v.software === AKKOMA),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Ability to manage account sessions.
     * @see GET /api/oauth_tokens.json
     * @see DELETE /api/oauth_tokens/:id
     */
    sessions: (v.software === PLEROMA || v.software === AKKOMA),

    /**
     * Can store client settings in the database.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    settingsStore: any([
      (v.software === PLEROMA || v.software === AKKOMA),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Can set content warnings on statuses.
     * @see POST /api/v1/statuses
     */
    spoilers: v.software !== TRUTHSOCIAL,

    /**
     * Ability to set a default expiry date to posts
     * @see https://docs.akkoma.dev/stable/development/API/differences_in_mastoapi_responses/#accounts
     */
    statusExpiry: v.software === AKKOMA && gte(v.version, '3.5.0'),

    /**
     * Can display suggested accounts.
     * @see {@link https://docs.joinmastodon.org/methods/accounts/suggestions/}
     */
    suggestions: any([
      v.software === MASTODON && gte(v.compatVersion, '2.4.3'),
      v.software === TRUTHSOCIAL,
      features.includes('v2_suggestions'),
    ]),

    /**
     * Supports V2 suggested accounts.
     * @see GET /api/v2/suggestions
     */
    suggestionsV2: any([
      v.software === MASTODON && gte(v.compatVersion, '3.4.0'),
      v.software === TRUTHSOCIAL,
      features.includes('v2_suggestions'),
    ]),

    /**
     * Can translate statuses
     * @see GET /api/v1/statuses/:id/translations/:language
     */
    translations: any([
      v.software === AKKOMA && features.find((f) => f === 'akkoma:machine_translation'),
    ]),

    /**
     * Trending statuses.
     * @see GET /api/v1/trends/statuses
     */
    trendingStatuses: v.software === MASTODON && gte(v.compatVersion, '3.5.0'),

    /**
     * Truth Social trending statuses API.
     * @see GET /api/v1/truth/trending/truths
     */
    trendingTruths: v.software === TRUTHSOCIAL,

    /**
     * Can display trending hashtags.
     * @see GET /api/v1/trends
     */
    trends: any([
      v.software === MASTODON && gte(v.compatVersion, '3.0.0'),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Supports Truth suggestions.
     */
    truthSuggestions: v.software === TRUTHSOCIAL,

    /**
     * Whether the backend allows adding users you don't follow to lists.
     * @see POST /api/v1/lists/:id/accounts
     */
    unrestrictedLists: (v.software === PLEROMA || v.software === AKKOMA),
  };
};

/** Features available from a backend */
export type Features = ReturnType<typeof getInstanceFeatures>;

/** Detect backend features to conditionally render elements */
export const getFeatures = createSelector([
  (instance: Instance) => instance,
], (instance): Features => {
  const features = getInstanceFeatures(instance);
  return Object.assign(features, overrides) as Features;
});

/** Fediverse backend */
interface Backend {
  /** Build name, if this software is a fork */
  build: string | null,
  /** Name of the software */
  software: string | null,
  /** API version number */
  version: string,
  /** Mastodon API version this backend is compatible with */
  compatVersion: string,
}

/** Get information about the software from its version string */
export const parseVersion = (version: string): Backend => {
  const regex = /^([\w+.]*)(?: \(compatible; ([\w]*) (.*)\))?$/;
  const match = regex.exec(version);

  const semver = match ? semverParse(match[3] || match[1]) : null;
  const compat = match ? semverParse(match[1]) : null;

  if (match && semver && compat) {
    return {
      build: semver.build[0],
      compatVersion: compat.version,
      software: match[2] || MASTODON,
      version: semver.version,
    };
  } else {
    // If we can't parse the version, this is a new and exotic backend.
    // Fall back to minimal featureset.
    return {
      build: null,
      compatVersion: '0.0.0',
      software: null,
      version: '0.0.0',
    };
  }
};
