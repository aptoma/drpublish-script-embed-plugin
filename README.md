### Install

```
cd drpublish-script-embed-plugin
npm install
cd /var/www
# create symlink
ln -s path/to/drpublish-script-embed-plugin script-embed
# Open location in your default browser
python -mwebbrowser http://localhost/script-embed/index.html

```

### Deploying

Get a free account on [heroku](https://dashboard.heroku.com/)
Install the [Heroku Toolbelt](https://toolbelt.heroku.com/).

```sh
$ git clone git@github.com:aptoma/drpublish-script-embed-plugin.git # or clone your own fork
$ cd drpublish-script-embed-plugin
$ heroku create
$ git push heroku master
$ heroku open
```
