// Must be defined first
const commerceKarmaUrl = "http://localhost:3000";

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
    starsHtml += createStarElement("/assets/full-star.png", "Rating star");
  }

  if (halfStars > 0) {
    starsHtml += createStarElement("/assets/half-star.png", "Rating half star");
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHtml += createStarElement("/assets/empty-star.png");
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
  const apiKey = readCookie("CK-api-key")

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

const injectUser = async (link, filters) => {
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

  const data = await get(
    "",
    filters ? filters : {},
    `${commerceKarmaUrl}/api/user`
  );

  console.log(data);

  if (data.error) {
    return false;
  }

  const users = data.user;

  const usersContainer = document.getElementById("CK-users");

  let injectHtml = "";

  for (let i = 0; i < users.length; i++) {
    injectHtml += `        
          <div class="CK-user">
             <a href="" class="CK-user-link">
                <h1 class="CK-user-name">${
                  users[i].name
                } <b class="CK-star-number">(${
      users[i].customerRating
    })</b></h1>
                <div id="CK-user-stars-${
                  users[i]._id
                }" class="CK-stars">${createStars(
      users[i].customerRating
    )}</div>
              </a>
          </div>`;
  }

  usersContainer.innerHTML = injectHtml;
};

// Authentication: DO NOT MODIFY

const url = window.location.href;
const jwt = url.match(/\[(.*?)\]/);

if (jwt) {
  document.cookie = `CK-jwt=${jwt[1]}; max-age=2592000;`;
}

const checkAuth = async (users, reviews) => {
  if (users == false || reviews == false) {
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
    return {apiKey, response};
  } catch (error) {
    return error;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const key = await checkApiKey(
    "eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IisuSFxcQWp1fD5ffS9zOHB-emQrTWxCc0xwZXMzdiQ0Q3g8bTtCQFtle0w4XCI7ZjBTMm9GXCIvcitDRmdXXT5WVjgiLCJ1c2VyIjoiNjU3NGZiZjM0YzFjMWFjYjIyNjI0ZTRiIiwiaWF0IjoxNzAzNTQ0MTA3LCJpc3MiOiJlVGVjaCAoQ29tbWVyY2UgS2FybWEpIiwiYXVkIjoiYmlkcy5yZXNwb25zaWJpZC5jb20ifQ.sLdK07TXdshkTXDJdLQb-YRvx9ZZfE1EPbjbVdcejDY"
  );
  const users = await injectUser();
  if (!(key.response instanceof Error)) {
    document.cookie = `CK-api-key=${key.apiKey}; SameSite=None; Secure=true; Expires= 1 Jan 3000 00:00:01 GMT`
  }
});

// Exports
export { injectSignIn, checkAuth, injectUser };