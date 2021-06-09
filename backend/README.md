## Install Steps

* Install homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

* Save homebrew in path

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"
```

* Install AWS CLI

```bash
brew install awscli
```

* Remaining steps

Check out this article, https://medium.com/serverlessguru/guide-first-serverless-project-630b91366505

## Testing

* Serverless Offline, https://github.com/dherault/serverless-offline

Check node version
```bash
node -v
```

If your node version is v15.5.0+ then you are going to have [issues](https://github.com/dherault/serverless-offline/issues/1150#issuecomment-750866436) with serverless-offline.

Install
```bash
npm i --save-dev serverless-offline
```

Update serverless.yml
```yaml
plugins:
  - serverless-offline
```

Run local server
```bash
sls offline
```

Test route in browser, http://localhost:3000/dev/users, if working
```json
{"Items":[],"Count":0,"ScannedCount":0}
```

### Adding Insomnia

* Install, https://insomnia.rest/download

Test create, update, delete routes

create, http://localhost:3000/dev/users POST

```json
{
    "name": "John Doe",
    "job": "frontend"
}
```

## Resources

* https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/