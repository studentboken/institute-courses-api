# Institute courses API for Node JS
### A fully async API written in ES6 for fetching courses from various sources
***
![npm badge](https://img.shields.io/npm/v/institute-courses-api.svg)

### Setting up

##### Installing

```
npm install institute-courses-api
```

##### Quickstart

###### CLI

```Bash
# Install
> npm install -g institute-courses-api
# Use
> institute-courses-api --help

Fetch courses

Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  --output, -o  Path to the output file
  -d, --debug   Run in debugging mode                                  [boolean]

```

###### Library

Todo.

### Documentation

The documentation is currently a bit sparse. For more information, refer to the source and issues on GitHub.

#### Methods

Todo.

#### Convenience methods

Todo.

#### Course schema

Todo.

### Contributing

Any contribution is welcome. If you're not able to code it yourself, perhaps someone else is - so post an issue if there's anything on your mind.

###### Development

Clone the repository:
```
git clone https://github.com/AlexGustafsson/institute-courses-api.git && cd institute-courses-api
```

Set up for development:
```
npm install
```

Follow the conventions enforced:
```
npm run lint
npm run test
npm run coverage
npm run check-duplicate-code
```

### Disclaimer

_Although the project is very capable, it is not built with production in mind. Therefore there might be complications when trying to use the API for large-scale projects meant for the public. The API was created to easily fetch information about books programmatically and as such it might not promote best practices nor be performant. This project is not in any way affiliated with BTH._
