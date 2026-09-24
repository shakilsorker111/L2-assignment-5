"use client";

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY =
  "gearup_access_token";

const USER_ROLE_KEY =
  "gearup_user_role";

export const setAuthCookies = (
  accessToken: string,
  role: string
) => {
  if (!accessToken) {
    console.error(
      "Access token is missing"
    );

    return;
  }

  Cookies.set(
    ACCESS_TOKEN_KEY,
    accessToken,
    {
      expires: 7,
      path: "/",
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
    }
  );

  Cookies.set(
    USER_ROLE_KEY,
    role,
    {
      expires: 7,
      path: "/",
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
    }
  );

  console.log(
    "GearUp authentication cookies saved"
  );
};

export const getAccessToken = () => {
  return Cookies.get(
    ACCESS_TOKEN_KEY
  );
};

export const getUserRole = () => {
  return Cookies.get(
    USER_ROLE_KEY
  );
};

export const clearAuthCookies = () => {
  Cookies.remove(
    ACCESS_TOKEN_KEY,
    {
      path: "/",
    }
  );

  Cookies.remove(
    USER_ROLE_KEY,
    {
      path: "/",
    }
  );

  console.log(
    "GearUp authentication cookies cleared"
  );
};