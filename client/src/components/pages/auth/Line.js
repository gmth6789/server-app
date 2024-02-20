import React, { useEffect, useState } from "react";
import liff from "@line/liff";
import { loginLine } from "../../../functions/auth";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/userSlice";

const Line = () => {
  const navi = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: "2003049957-Rq6ZdvQ4" });
        if (liff.isLoggedIn) {
          await handleLogin();
        }
      } catch (err) {
        console.log(err);
      }
    };

    initLiff();
  }, []);

  const handleLogin = async () => {
    try {
      // code
      const profile = await liff.getProfile();
      await loginLine(profile)
        .then((res) => {
          console.log(res);
          setLoading(false);
          dispatch(
            login({
              name: res.data.payload.user.name,
              role: res.data.payload.user.role,
              token: res.data.token,
            }),
          );
          localStorage.setItem("token", res.data.token);
          roleRedirects(res.data.payload.user.role);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
      // const idToken = liff.getIDToken()
      // console.log(profile,idToken)
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const roleRedirects = (role) => {
    if (role === "admin") {
      navi("/admin/index");
    } else {
      navi("/user/index");
    }
  };

  return loading ? <h1>Loading...</h1> : null;
};

export default Line;
