import instance from "../axios";

export const apiVerifySignature = (data) =>
  instance({
    url: "/digital-signature/verify",
    method: "post",
    data,
  });

export const apiGetSignatureById = (id) =>
  instance({
    url: `/digital-signature/user/${id}`,
    method: "get",
  });
