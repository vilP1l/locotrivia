workflow "Publish to NPM" {
  on = "push"
  resolves = ["Publish"]
}

action "Git Config" {
  uses = "srt32/git-actions@v0.0.3"
  args = "git config --global user.email \"vil@vilp1l.co\""
}

action "Bump version" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Git Config"]
  runs = "version minor"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "Publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Bump version"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
