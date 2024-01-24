# Commerce Karma Components Light
**Import note:** This package is not currently supported since Commerce Karma has not yet launched. However, it is nearing it's final form and can be used without error. Full support coming soon.

Commerce Karma Components Light is a simple version based on Commerce Karma Components. It allows you to embed a pre-styled Commerce Karma customer rating into your application with minimal HTML and JS and is support by all JS frameworks.

## Installation
Clone this project into your source directory for your frontend code. To do this run:

```
cd your-dir-of-choice
git clone https://github.com/eTech-Source/commerce-karma-components-light
```

## Included Files/Folders

- `styles.css` Used to style the components
- `script.js` The core components
- `index.html` A test file showing how to use the components
- `README.md` This file
- `.vscode` Config for VS Code

## Add the components to your project
### Add the the container element to render the Commerce Karma customer(s)
Using a `div` as the container element is recommended. However, any block scoped element will work:

```
<div id="CK-customers"></div>
```

Notice the id `CK-customers` this required. In fact all ids/classes used by Commerce Karma Components light is prefix with `CK-` this is to avoid classes/ids being overridden by your application.

### Call the functions
In order to inject the components a function needs to be called to render them. Fist import the functions:

```
import { InjectCustomer} from "commerce-karma-components";
```

Then call it:

```
const customers = await injectCustomer();
```

## Choose your authentication solution
The data provided in the components can only be accessed through an authenticated user. You can authenticate by: using the sign in component, users entering an API key, or you using your own API key **(not recommended)**. 

### Use the sign in component
This is by far the simplest option. 

First import the `checkAuth` function:

```
import { checkAuth } from "commerce-karma-components";
```

Now pass the `customers` variable to the `checkAuth` function which will conditionally render the sign in form. 

```
    const customers = await injectCustomer();
    await checkAuth(customers);
```

### Have your user enter an API key
You can have your user enter an Commerce Karma API key. 

First import the `checkApiKey` function:

```
import {checkApiKey} from "commerce-karma-components";
```

Now call the function:

```
const key = await checkApiKey(apiKey);
```

Finally check for errors and save to browser cookies:

```
if (!(key.response instanceof Error)) {
    document.cookie = `CK-api-key=${key.apiKey}; SameSite=None; Secure=true; Expires= 1 Jan 3000 00:00:01 GMT`
  }
```

This approach has lots of flexibility. There are only two requirements:

1. Errors need to be handled in your application. If you don't implement your own error handling the components simply won't render creating a bad experience for your users.
2. Saving the API key as a cookie. The cookie must be named `CK-api-key` and should not expire quickly.

If you need the api key to work across all instances of your application that your user is signed into a possible approach is to fetch the API key from your database.


### Use your own API key **(Not recommended)**
Follow the above example. Using your own API key. This not recommended. It will be phased out with future updates.

## Deep dive on functions
### checkAuth
Embed a sign in interface to your application.

#### Props
- `customers`: A required property for using the sign in popup.

#### Built in behavior
- Cookie `CK-jwt` saved after successful sign in.

#### checkApiKey
A helper function to check the validity of an API key.

#### Props
- `apiKey` the API key to verify.

#### Built in behavior
None.

#### Return value
- `apiKey?` If the API key is valid then the same passed API key will be returned back.
- `response?`If the API key is valid then a response object will be returned.
- `error?` If any errors take place during the validation process (including an invalid key) then an `Error` object will be returned.


## Deep dive on components
### injectCustomer
Inject one or many customers into your application.

#### Props
- `filters: {name?: string, email?: string, city?: string}`: An optional  property allowing for custom filtering of customers.
- The `email` field is the only exact matching field, the others do not filter customers.

#### Built in behavior
- When the query string is appended to the url the display customer(s). Query params include: `CK-name, CK-email, CK-city`.
- The `CK-email` field is the only exact matching field, the others do not filter customers.
- If `CK-email` or the `email` filters is not specified **nothing** will be returned.
- If all filters or query params are specified and the customer still doesn't exist the customer will automatically be added to Commerce Karma.

### injectCustomerMini
Inject one customer rating into your application in to a small a widget.

#### Props
- `filters: {name?: string, email?: string, city?: string}`: An optional  property allowing for custom filtering of customers.
- The `email` field is the only exact matching field, the others do not filter customers.

#### Built in behavior
- When the query string is appended to the url the display customer(s). Query params include: `CK-name, CK-email, CK-city`.
- The `CK-email` field is the only exact matching field, the others do not filter customers.
- If `CK-email` or the `email` filters is not specified **nothing** will be returned.

**Note:** that the customer will not automatically be added with this component. 

### injectReviews
Render a customer with a list of up to three of their most recent reviews. 

#### Props
- `filters: {name?: string, email?: string, city?: string}`: An optional  property allowing for custom filtering of customers.
- The `email` field is the only exact matching field, the others do not filter customers.

#### Built in behavior
- When the query string is appended to the url the display customer(s). Query params include: `CK-name, CK-email, CK-city`.
- The `CK-email` field is the only exact matching field, the others do not filter customers.
- If `CK-email` or the `email` filters is not specified **nothing** will be returned.
- Change card to only show a write review button.

**Note:** that the customer will not automatically be added with this component. 

Excited to see how you use these!