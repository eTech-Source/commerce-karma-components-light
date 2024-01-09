// Must be defined first
const commerceKarmaUrl = "https://commerce-karma.vercel.app";

const injectSignIn = () => {
  const signInContainer = document.getElementById("CK-signin");
  signInContainer.innerHTML = `
        <h1 id="CK-signin-heading">Please Sign In</h1>
        <p id="CK-signin-message">Sign in to Commerce Karam to rate your customers and view customer ratings.</p>
        <button id="CK-signin-btn"><a href="${commerceKarmaUrl}/sign-in?redirect_url=${window.location.href}" id="CK-signin-link">Sign In</a></button>
    `;
};

// Utils

const arrayToKeyValueObject = (arr) => {
  if (arr.length % 2 !== 0) {
    throw new Error("Array length must be even for key-value pairing.");
  }

  const resultObject = {};

  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value = arr[i + 1];
    resultObject[key] = value;
  }

  return resultObject;
};

const createStarElement = (src, alt) =>
  `<img src="${src}" alt="${alt}" height="40" class="star" />`;

const createStars = (count) => {
  let starsHtml = "";

  const fullStars = Math.floor(count);
  const halfStars = Math.round((count % 1) * 10) / 10;
  const emptyStars = 5 - fullStars - (halfStars > 0 ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    starsHtml += createStarElement(
      "https://res.cloudinary.com/dpiyvkmo8/image/upload/v1704152834/commerce-karma-images/hjeyidjhfjsbf6fyjdxe.png",
      "Rating star"
    );
  }

  if (halfStars > 0) {
    starsHtml += createStarElement(
      "https://res.cloudinary.com/dpiyvkmo8/image/upload/v1704152834/commerce-karma-images/st9fx3guqowllvstwaia.png",
      "Rating half star"
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHtml += createStarElement(
      "https://res.cloudinary.com/dpiyvkmo8/image/upload/v1704152834/commerce-karma-images/wtgvnlz5ivekfzodyp4k.png"
    );
  }

  return starsHtml;
};

// Get cookie

const readCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return "";
};

// Fetch calls for data

const get = async (id, filters, url) => {
  const encodedFilters = btoa(JSON.stringify(filters));

  // Required to complete any requests other than OPTIONS

  const authorization = readCookie("CK-jwt");
  const apiKey = readCookie("CK-api-key");

  const rawResponse = await fetch(url, {
    headers: {
      id: id,
      filters: encodedFilters,
      Authorization: authorization,
      "Api-Key": apiKey,
    },
  });

  const response = await rawResponse.json();

  return response;
};

// Inject data into correct divs

const injectCustomer = async (link, filters) => {
  const urlParams = new URLSearchParams(window.location.search);

  if (!filters && urlParams) {
    for (let params of urlParams) {
      let paramsArray = [];
      params.forEach((param) => {
        paramsArray.push(param.replace("CK-", ""));
      });
      filters = arrayToKeyValueObject(paramsArray);
    }
  }

  const search = window.location.search.replace(/CK-/g, "");

  const data = await get(
    "",
    filters ? filters : {},
    `${commerceKarmaUrl}/api/user`
  );

  if (data.error) {
    return false;
  }

  const customers = data.user;

  const customersContainer = document.getElementById("CK-customers");

  let injectHtml = "";

  if (customers.length === 0) {
    injectHtml += `
      <button id="CK-add-customer-btn"><a href="${commerceKarmaUrl}/app/reviews/newCustomer${search}">Add customer</a></button>
    `;
  }

  for (let i = 0; i < customers.length; i++) {
    injectHtml += `        
          <div class="CK-customer">
             <a href="" class="CK-customer-link">
                <h1 class="CK-customer-name">${
                  customers[i].name
                } <b class="CK-star-number">(${
      customers[i].customerRating
    })</b></h1>
                <div id="CK-customer-stars-${
                  customers[i]._id
                }" class="CK-stars">${createStars(
      customers[i].customerRating
    )}</div>
              </a>
          </div>`;
  }

  customersContainer.innerHTML = injectHtml;
};

// Authentication: DO NOT MODIFY

const url = window.location.href;
const jwt = url.match(/\[(.*?)\]/);

if (jwt) {
  document.cookie = `CK-jwt=${jwt[1]}; max-age=2592000;`;
}

const checkAuth = async (customers) => {
  if (customers == false) {
    injectSignIn();
  }
};

const checkApiKey = async (apiKey) => {
  try {
    const rawResponse = await fetch(`${commerceKarmaUrl}/api/keys`, {
      headers: { Authorization: apiKey },
    });
    const response = await rawResponse.json();
    if (rawResponse.status >= 400) {
      throw new Error(response.message);
    }
    return { apiKey, response };
  } catch (error) {
    return error;
  }
};

// Exports
export { injectSignIn, checkAuth, injectCustomer, checkApiKey };
