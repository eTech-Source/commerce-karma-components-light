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
      "https://res.cloudinary.com/dpiyvkmo8/image/upload/v1705698074/Star_1_m83dzr.svg",
      "Rating star"
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHtml += createStarElement(
      "https://res.cloudinary.com/dpiyvkmo8/image/upload/v1705698614/Star_5_mhx3mn.svg",
      "Empty Star"
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

const post = async (createData, url) => {
  const authorization = readCookie("CK-jwt");
  const apiKey = readCookie("CK-api-key");

  const rawResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ body: createData }),
    headers: {
      Authorization: authorization,
      "Api-Key": apiKey,
    },
  });
  const response = await rawResponse.json();

  return response;
};

// Inject data into correct divs
const injectCustomer = async (filters) => {
  const urlParams = new URLSearchParams(window.location.search);
  let exactFilters;

  if (filters && filters.email) {
    exactFilters = {
      email: filters.email,
    };
  }

  if (!filters && urlParams) {
    let paramsArray = [];
    let urlFilters = {};

    for (let params of urlParams) {
      params.forEach((param) => {
        paramsArray.push(param.replace("CK-", ""));
      });
      urlFilters = arrayToKeyValueObject(paramsArray);

      if (urlFilters.email || urlFilters.name || urlFilters.city) {
        filters = {
          name: urlFilters.name,
          email: urlFilters.email,
          city: urlFilters.city,
        };
        exactFilters = { email: urlFilters.email };
      }
    }
  }

  const search = window.location.search.replace(/CK-/g, "");

  if (!exactFilters.email) {
    return;
  }

  const data = await get(
    "",
    exactFilters ? exactFilters : {},
    `${commerceKarmaUrl}/api/user`
  );

  if (data.error) {
    return false;
  }

  const customers = data.user;

  const customersContainer = document.getElementById("CK-customers");

  let injectHtml = "";

  if (
    customers.length === 0 &&
    filters &&
    filters.name &&
    filters.email &&
    filters.city
  ) {
    await post(filters, `${commerceKarmaUrl}/api/user`);
  } else if (customers.length === 0) {
    injectHtml += `
    <button id="CK-add-customer-btn"><a href="${commerceKarmaUrl}/app/reviews/newCustomer${search}" target="blank">Add customer</a></button>
  `;
  }

  for (let i = 0; i < customers.length; i++) {
    const { reviews } = await get(
      "",
      { recipient: customers[i]._id },
      `${commerceKarmaUrl}/api/reviews/add`
    );
    injectHtml += `        
          <div class="CK-customer">
             <a href="${commerceKarmaUrl}/app/reviews/customer/${
      customers[i].userId
    }" class="CK-customer-link" target="blank">
                <h1 class="CK-customer-name" class="CK-name">${
                  customers[i].name
                }</h1>
                <div class="CK-info">
                <div id="CK-customer-stars-${
                  customers[i]._id
                }" class="CK-stars">${createStars(
      customers[i].customerRating
    )}</div>
    <i>Based on ${reviews.length} ${
      reviews.length === 1 ? "review" : "reviews"
    }</i>
    </div>
              </a>
          </div>`;
  }

  customersContainer.innerHTML = injectHtml;
};


const injectCustomerMini = async (filters) => {
  const urlParams = new URLSearchParams(window.location.search);
  let exactFilters;

  if (filters && filters.email) {
      exactFilters = {
          email: filters.email,
      };
  }

  if (!filters && urlParams) {
      let paramsArray = [];
      let urlFilters = {};

      for (let params of urlParams) {
          params.forEach((param) => {
              paramsArray.push(param.replace("CK-", ""));
          });
          urlFilters = arrayToKeyValueObject(paramsArray);

          if (urlFilters.email || urlFilters.name || urlFilters.city) {
              filters = {
                  name: urlFilters.name,
                  email: urlFilters.email,
                  city: urlFilters.city,
              };
              exactFilters = { email: urlFilters.email };
          }
      }
  }

  if (!exactFilters || !exactFilters.email) {
      return;
  }

  const emails = filters.email.split(",");
  const data = await get(
      "",
      { email: emails },
      `${commerceKarmaUrl}/api/user`
  );

  if (data.error) {
      return false;
  }

  const customers = data.user;
  const customersContainer = document.getElementsByClassName(
      "CK-customers-mini"
  );

  if (customers.length === 0) {
      injectHtml.push(`
          <div class="CK-customer-mini">
              <a href="${commerceKarmaUrl}/app/reviews/newCustomer" class="CK-customer-link-mini" target="_blank">
                  <span class="CK-rating-text">Rating:</span>
                  <div class="CK-stars">${createStars(0)}</div>
                  <i>No reviews yet</i>
                  <div class="CK-write-review-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="18" viewBox="0 0 17 18" fill="none">
                          <path d="M3.50002 10.6667H6.04169L10.2084 6.49999C10.3334 6.37499 10.4271 6.23263 10.4896 6.07291C10.5521 5.91318 10.5834 5.75693 10.5834 5.60416C10.5834 5.45138 10.5486 5.30207 10.4792 5.15624C10.4097 5.01041 10.3195 4.87499 10.2084 4.74999L9.45835 3.95832C9.33335 3.83332 9.19446 3.73957 9.04169 3.67707C8.88891 3.61457 8.72919 3.58332 8.56252 3.58332C8.40974 3.58332 8.25349 3.61457 8.09377 3.67707C7.93405 3.73957 7.79169 3.83332 7.66669 3.95832L3.50002 8.12499V10.6667ZM4.75002 9.41666V8.62499L6.85419 6.52082L7.27085 6.89582L7.64585 7.31249L5.54169 9.41666H4.75002ZM7.27085 6.89582L7.64585 7.31249L6.85419 6.52082L7.27085 6.89582ZM7.81252 10.6667H13.5V8.99999H9.47919L7.81252 10.6667ZM0.166687 17.3333V2.33332C0.166687 1.87499 0.329881 1.48263 0.65627 1.15624C0.982659 0.829851 1.37502 0.666656 1.83335 0.666656H15.1667C15.625 0.666656 16.0174 0.829851 16.3438 1.15624C16.6702 1.48263 16.8334 1.87499 16.8334 2.33332V12.3333C16.8334 12.7917 16.6702 13.184 16.3438 13.5104C16.0174 13.8368 15.625 14 15.1667 14H3.50002L0.166687 17.3333ZM2.79169 12.3333H15.1667V2.33332H1.83335V13.2708L2.79169 12.3333Z" fill="#757575"/>
                      </svg>
                  </div>
              </a>
          </div>`
      );
  }

  for (let i = 0; i < customers.length; i++) {
      const { reviews } = await get(
          "",
          { recipient: customers[i]._id },
          `${commerceKarmaUrl}/api/reviews/add`
      );

      let injectHtml = `
          <div class="CK-customer-mini">
              <a href="${commerceKarmaUrl}/app/reviews/customer/${customers[i].userId}" class="CK-customer-link-mini" target="_blank">
                  <span class="CK-rating-text">Rating:</span>
                  <div id="CK-customer-stars-${customers[i]._id}" class="CK-stars">${createStars(customers[i].customerRating)}</div>
                  <i>Based on ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}</i>
              </a>
          </div>`;

      customersContainer[i].innerHTML += injectHtml[i];
  }
};


const injectReviews = async (filters) => {
  let exactFilters;
  const reviewsContainer = document.getElementById("CK-reviews");

  const urlParams = new URLSearchParams(window.location.search);

  if (!filters && urlParams) {
    let paramsArray = [];
    let urlFilters = {};

    for (let params of urlParams) {
      params.forEach((param) => {
        paramsArray.push(param.replace("CK-", ""));
      });
      urlFilters = arrayToKeyValueObject(paramsArray);

      if (urlFilters.email || urlFilters.name || urlFilters.city) {
        filters = {
          name: urlFilters.name,
          email: urlFilters.email,
          city: urlFilters.city,
        };
        exactFilters = { email: urlFilters.email };
      }
    }
  }

  if (filters && filters.email) {
    exactFilters = {
      email: filters.email,
    };
  }

  const search = window.location.search.replace(/CK-/g, "");

  if (!exactFilters.email) {
    return;
  }

  const data = await get(
    "",
    exactFilters ? exactFilters : {},
    `${commerceKarmaUrl}/api/user`
  );

  if (data.user.length === 0) {
    reviewsContainer.innerHTML = `
    <div id="CK-customer">
    <div id="CK-profile">
      <div id="CK-profile-pic">
      ${filters.name.charAt(0).toUpperCase()}
      </div>
      <div id="CK-customer-data">
        <h1 id="CK-customer-card-name" class="CK-name">${filters.name}</h1>
        <div id="CK-customer-review-stats">
          <h2 id="CK-review-number">0</h2>
          <div id="CK-profile-info">
            <div class="CK-stars">${createStars(0)}</div>
            <i>No reviews yet</i>
          </div>
         </div>
        </div>
      </div>
      <a href="${commerceKarmaUrl}/app/reviews/newCustomer" target="blank">
          <button class="CK-profile-btn" style="width: 300px;">Write A Review</button>
        </a>
  </div>
    `;
    return;
  }
  const customer = data.user[0];
  const { reviews } = await get(
    "",
    { recipient: customer._id },
    `${commerceKarmaUrl}/api/reviews/add`
  );

  let renderReviews = "";
  let i = 0;

  for (const review of reviews) {
    if (i >= 3) {
      break;
    }

    const data = await get(review.author, {}, `${commerceKarmaUrl}/api/user`);
    const author = data.user[0];
    renderReviews += `
      <div class="CK-review">
        <h1 class="CK-name">${
          review.status === "anonymous"
            ? "Posted Anonymously"
            : author.businessName
        }</h1>
        <div class="CK-stars">
          ${createStars(review.stars)}
        </div>
        <p>"${review.text}"</p>
      </div>
    `;

    i++;
  }

  reviewsContainer.innerHTML = `
    <div id="CK-customer">
      <div id="CK-profile">
        <div id="CK-profile-pic">
        ${customer.name.charAt(0).toUpperCase()}
        </div>
        <div id="CK-customer-data">
          <h1 id="CK-customer-card-name" class="CK-name">${customer.name}</h1>
          <div id="CK-customer-review-stats">
            <h2 id="CK-review-number">${customer.customerRating}</h2>
            <div id="CK-profile-info">
              <div class="CK-stars">${createStars(
                customer.customerRating
              )}</div>
              <i>Based on ${reviews.length} ${
    reviews.length === 1 ? "review" : "reviews"
  }</i>
            </div>
           </div>
          </div>
        </div>
    </div>
    <hr class="CK-divider"/>
    ${renderReviews}
    <a href="${commerceKarmaUrl}/app/reviews/customer/${
    customer.userId
  }" target="blank">
      <button class="CK-profile-btn">Read More Reviews</button>
    </a>
    <a href="${commerceKarmaUrl}/app/reviews/customer/${
    customer.userId
  }" target="blank">
      <button class="CK-profile-btn">Write A Review</button>
    </a>
  `;
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

document.addEventListener("DOMContentLoaded", async () => {
  const key = await checkApiKey(
    "eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IiwvTmlqRCxqNWVrUDI8flgwNGtIXy4uTHZOQSwzP1RAQ0BSYmt1MycpT0VgJW98RD80ViFZNzZZSS0yeDNJM2AiLCJ1c2VyIjoiNjU3NGZiZjM0YzFjMWFjYjIyNjI0ZTRiIiwiaWF0IjoxNzA2MTQ5MTgxLCJpc3MiOiJlVGVjaCAoQ29tbWVyY2UgS2FybWEpIiwiYXVkIjoicG9zdG1hbiJ9.xZJEc4rZ3a1Wi8Vv0PDyIUIB2Hf8-qpcKuAHo6HFI2c"
  );

  if (!(key.response instanceof Error)) {
    document.cookie = `CK-api-key=${key.apiKey}; SameSite=None; Secure=true; Expires= 1 Jan 3000 00:00:01 GMT`;
  }

  const customers = await injectCustomer();
  const review = await injectReviews();
  const miniCustomer = await injectCustomerMini();
});

// Exports
export {
  injectSignIn,
  checkAuth,
  injectCustomer,
  checkApiKey,
  injectCustomerMini,
};
