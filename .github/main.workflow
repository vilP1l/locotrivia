workflow "Publish to NPM" {
  on = "push"
  resolves = ["Publish"]
}

action "Increase version number" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "version"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "Publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Increase version number"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
