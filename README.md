# Example Swagger API Documentation

## Style Guide

Edit using `Sublime Text 3` and the `.sublime-project` file in this repository.  You will also need to install the following plugins:

* [Neon Color Scheme](https://packagecontrol.io/packages/Neon%20Color%20Scheme)

## Installation

This requires that both npm and grunt-cli are installed. After setting the
appropriate proxy settings, on OS X this can be accomplished with:

```bash
brew install npm
npm install -g grunt
npm install -g grunt-cli
```

In order to generate documentation, you will need a few other packages:

```bash
npm install
grunt setup
```

## Updating documentation

Before updating these documents, please familiarize yourself with the official [Swagger Spec](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md) and [JSON Schema](http://json-schema.org/).

Also see:

* http://spacetelescope.github.io/understanding-json-schema/

To generate HTML (`site/index.html`), run:

```bash
grunt build
```

If you wish to view live updates while you are editing, the following command will open the generated code in your browser and regenerate the HTML whenever you update the source:

```bash
grunt watch
```

When adding this repository to a CI server where you only want to test the Swagger without generating HTML, use:

```bash
grunt test
```
