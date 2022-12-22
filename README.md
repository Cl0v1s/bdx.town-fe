# Mangane

Mangane is an alternative frontend for Pleroma, Akkoma and Mastodon with a focus on ease of use, readability and custom branding.

This project is developped for [BDX-town](http://bdx.town/) Akkoma instance. Akkoma is a fork of Pleroma who mostly adds features, exposing them through new API endpoints. As of today, Akkoma and Pleroma API are compatible.

Moreover, Mangane already has a feature detection system allowing us to adapt the experience following what platform is used as a backend.

We are speaking about Akkoma here since we are planning to add akkoma specific features to the project without breaking any existing compatibility.

![UI Mixed](./docs/ui-mixed.png)
![UI Dark](./docs/ui-dark.png)
![UI Light](./docs/ui-light.png)

## :rocket: Deploy on Pleroma/Akkoma

Installing Mangane on an existing Pleroma or Akkoma instance is easy.
Log in with SSH your server and follow those instructions depending on your configuration.

### Download

First you need to download Mangane on your server.

#### For OTP install

```
/opt/pleroma/bin/pleroma_ctl frontend install mangane --ref dist --build-url https://github.com/BDX-town/Mangane/releases/latest/download/static.zip
```
*Note: The pleroma_ctl path may vary on your system*

#### For Mix/Source install

```
mix pleroma.frontend install mangane --ref dist --build-url https://github.com/BDX-town/Mangane/releases/latest/download/static.zip
```

#### With Admin-fe 

If database configuration is enabled, you can also install Mangane from the Admin interface of Pleroma/Akkoma. 
Just fill the form at Frontend/Available like this.

![admin-fe](./docs/admin-ui-1.png)

### Activation

Then you need to activate the frontend so it will be available to your users.

#### Config.exs

Edit your configuration files to add/edit the `config :pleroma, :frontends` section like this 

```
config :pleroma, :frontends,
  primary: %{
    "name" => "mangane",
    "ref" => "dist"
  }
```

##### Admin-fe with database configuration enabled

Just fill the form at Frontend/frontends/Primary like this.

![admin-fe](./docs/admin-ui-2.png)


**That's it!** :tada:

**Mangane FE is now installed.**  
The change will take effect immediately, just refresh your browser tab, and Mangane will replace the default Pleroma FE or Akkoma FE interface. 
You may need to restart Pleroma/Akkoma for the change to take effect.

## :elephant: Deploy on Mastodon

See [Installing Mangane over Mastodon](https://docs.soapbox.pub/frontend/administration/mastodon/).

## How does it work?

Mangane is a [single-page application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) that runs entirely in the browser with JavaScript.

It has a single HTML file, `index.html`, responsible only for loading the required JavaScript and CSS.
It interacts with the backend through [XMLHttpRequest (XHR)](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

Here is a simplified example with Nginx:

```nginx
location /api {
  proxy_pass http://backend;
}

location / {
  root /opt/soapbox;
  try_files $uri index.html;
}
```

(See [`mastodon.conf`](https://github.com/BDX-town/Mangane/blob/master/installation/mastodon.conf) for a full example.)

Mangane incorporates much of the [Mastodon API](https://docs.joinmastodon.org/methods/), [Pleroma API](https://api.pleroma.social/), and more.
It detects features supported by the backend to provide the right experience for the backend.

# Running locally

To get it running, just clone the repo:

```sh
git clone https://github.com/BDX-town/Mangane.git
cd Mangane
```

Ensure that Node.js and Yarn are installed, then install dependencies:

```sh
yarn
```

Finally, run the dev server:

```sh
yarn dev
```

**That's it!** :tada:

It will serve at `http://localhost:3036` by default.

You should see an input box - just enter the domain name of your instance to log in.

Tip: you can even enter a local instance like `http://localhost:3000`!

### Troubleshooting: `ERROR: NODE_ENV must be set`

Create a `.env` file if you haven't already.

```sh
cp .env.example .env
```

And ensure that it contains `NODE_ENV=development`.
Try again.

## Developing against a live backend

You can also run Mangane FE locally with a live production server as the backend.

> **Note:** Whether or not this works depends on your production server. It does not seem to work with Cloudflare or VanwaNet.

To do so, just copy the env file:

## Local Dev Configuration

The following configuration variables are supported supported in local development.
Edit `.env` to set them.

All configuration is optional, except `NODE_ENV`.

#### `NODE_ENV`

The Node environment.
Mangane checks for the following options:

- `development` - What you should use while developing Mangane FE.
- `production` - Use when compiling to deploy to a live server.
- `test` - Use when running automated tests.

#### `BACKEND_URL`

URL to the backend server.
Can be http or https, and can include a port.
For https, be sure to also set `PROXY_HTTPS_INSECURE=true`.

**Default:** `http://localhost:4000`

#### `PROXY_HTTPS_INSECURE`

Allows using an HTTPS backend if set to `true`.

This is needed if `BACKEND_URL` is set to an `https://` value.
[More info](https://stackoverflow.com/a/48624590/8811886).

**Default:** `false`

# Yarn Commands

The following commands are supported.
You must set `NODE_ENV` to use these commands.
To do so, you can add the following line to your `.env` file:

```sh
NODE_ENV=development
```

#### Local dev server
- `yarn dev` - Run the local dev server.

#### Building
- `yarn build` - Compile without a dev server, into `/static` directory.

#### Translations
- `yarn manage:translations` - Normalizes translation files. Should always be run after editing i18n strings.

#### Tests
- `yarn test:all` - Runs all tests and linters.

- `yarn test` - Runs Jest for frontend unit tests.

- `yarn lint` - Runs all linters.

- `yarn lint:js` - Runs only JavaScript linter.

- `yarn lint:sass` - Runs only SASS linter.

# Contributing

We welcome contributions to this project. To contribute, first review the [Contributing doc](docs/contributing.md)

Additional supporting documents include:
* [Mangane History](docs/history.md)
* [Redux Store Map](docs/history.md)

# Customization

Mangane supports customization of the user interface, to allow per instance branding and other features.  Current customization features include:

* Instance name
* Site logo
* Favicon
* About page
* Terms of Service page
* Privacy Policy page
* Copyright Policy (DMCA) page
* Promo panel list items, e.g. blog site link
* Mangane extensions, e.g. Patron module
* Default settings, e.g. default theme

Customization details can be found in the [Customization doc](docs/customization.md)

# License & Credits

Mangane is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Mangane is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Mangane.  If not, see <https://www.gnu.org/licenses/>.

Mangane make use of code from other opensource and free software under various licenses:

- Mangane is based on [Soapbox](https://soapbox.pub) frontend for Rebased, Pleroma, Mastodon, licensed under AGPL v3 or later.

- `static/sounds/chat.mp3` and `static/sounds/chat.oga` are from [notificationsounds.com](https://notificationsounds.com/notification-sounds/intuition-561) licensed under CC BY 4.0.

- Mangane use part of [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) licensed by Tailwindlab under the simple permissive MIT License.
