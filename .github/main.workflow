workflow "Publish to NPM" {
  on = "push"
  resolves = [
    "Publish",
    "Increase version number",
  ]
}

action "Increase version number" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "version minor"
  secrets = ["NPM_AUTH_TOKEN"]
  runs = "git config --global user.email \"vil@vilp1l.co\""
}

action "Publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Increase version number"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
