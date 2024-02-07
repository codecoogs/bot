![bot](https://user-images.githubusercontent.com/80173797/180626545-3b12b751-b7d1-4a37-9f52-c977bfe21052.png)

Bot is a bot application for Code[Coogs] [discord](https://discord.com/invite/e33CQVNTSV)

## Getting Started

### Prerequisites
Make sure you have the following on your machine:
- Git - [Download & Install](https://git-scm.com/downloads) | [Documentation](https://git-scm.com/doc)
- Node - [Download & Install](https://nodejs.org/en/download/) | [Documentation](https://nodejs.org/en/docs/)
- pnpm - [Install](https://pnpm.io/installation) | [Documentation](https://pnpm.io/motivation)

We recommend being familiar with these:
- TypeScript - [Documentation](https://www.typescriptlang.org/docs/)
- discord.js - [Documentation](https://discord.js.org/#/docs/discord.js/main/general/welcome)

### Installation
Clone the repository onto your machine
```bash
$ git clone https://github.com/codecoogs/bot.git
```

## Usage
Create `.env` file and add environment variables
```
BOT_TOKEN=
CLIENT_ID=
GUILD_ID=
```
Create `.env.development` file and add environment variables
```
API_BASE_URL=http://localhost:3000/v1
```
Create `.env.production` file and add environment variables
```
API_BASE_URL=api.codecoogs.com/v1
```
Run this command to start the project
```
pnpm run start
```


## Contributing
Please make sure to read the [Contributing Guide](https://github.com/codecoogs/.github/blob/main/CONTRIBUTING.md)

## License
Licensed under the [MIT](https://opensource.org/licenses/MIT) license.
