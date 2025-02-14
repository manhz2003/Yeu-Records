import React, { useState } from "react";
import Swal from "sweetalert2";
import { apiVerifySignature } from "../../apis";
import CryptoJS from "crypto-js";

const DigitalSignature = () => {
  const [email, setEmail] = useState("");
  const [digitalSignature, setDigitalSignature] = useState("");
  const [file, setFile] = useState(null);
  const [musicInfo, setMusicInfo] = useState(null);

  const [publicKey, setPublicKey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !digitalSignature || !publicKey) {
      Swal.fire({
        icon: "error",
        title: "error!",
        text: "Please fill in all information!",
      });
      return;
    }

    const requestData = {
      digitalSignature,
      publicKey,
      user: { email },
    };

    try {
      const response = await apiVerifySignature(requestData);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "success!",
          text: "Digital signature has been successfully authenticated!",
        });

        Swal.fire({
          icon: "info",
          title: "User information",
          html: `
            <p><strong>Verify Signature:</strong> ${response?.data.result.signatureValid}</p>
          `,
        });

        setEmail("");
        setDigitalSignature("");
        setPublicKey("");
      } else if (response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "error!",
          text: response.data.error,
        });
      }
    } catch (error) {
      if (error.status === 400) {
        Swal.fire({
          icon: "error",
          title: "error!",
          text: error?.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "error!",
          text: "Unable to connect to server. Please try again later.",
        });
      }
    }
  };

  // Giải mã dữ liệu chữ ký với khóa bí mật
  const decryptSignature = (encryptedData, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const verifySignatureInMp3 = async (file, secretKey) => {
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    const signaturePrefix = "SIGNATURE";
    const prefixBytes = Uint8Array.from(
      signaturePrefix.split("").map((char) => char.charCodeAt(0))
    );

    let signatureStartIndex = -1;
    for (let i = fileData.length - prefixBytes.length; i >= 0; i--) {
      if (
        fileData
          .slice(i, i + prefixBytes.length)
          .every((value, idx) => value === prefixBytes[idx])
      ) {
        signatureStartIndex = i;
        break;
      }
    }

    if (signatureStartIndex === -1) {
      throw new Error("No embedded signature found in the file.");
    }

    const signatureData = fileData.slice(
      signatureStartIndex + signaturePrefix.length
    );
    const signatureString = new TextDecoder().decode(signatureData);

    try {
      // Giải mã dữ liệu chữ ký
      const decryptedSignature = decryptSignature(
        atob(signatureString),
        secretKey
      );
      const parsedSignature = JSON.parse(decryptedSignature);

      const { musicName, digitalSignature, publicKey, certificate } =
        parsedSignature;

      if (!musicName) throw new Error("Missing musicName in signature data.");
      if (!digitalSignature)
        throw new Error("Missing digitalSignature in signature data.");
      if (!publicKey) throw new Error("Missing publicKey in signature data.");
      if (!certificate)
        throw new Error("Missing certificate in signature data.");

      return parsedSignature;
    } catch (error) {
      throw new Error("Invalid signature format.");
    }
  };

  const handleFileVerify = async () => {
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Please upload a music file to verify.",
      });
      return;
    }

    try {
      const secretKey = import.meta.env.VITE_SECRET_KEY;
      const { musicName, digitalSignature, publicKey, certificate } =
        await verifySignatureInMp3(file, secretKey);

      // Lưu thông tin vào state để hiển thị
      setMusicInfo({
        musicName,
        digitalSignature,
        publicKey,
        certificate,
      });

      // Hiển thị thông tin ra Swal
      Swal.fire({
        icon: "success",
        title: "Signature Found!",
        html: `
          <p><strong>Music Name:</strong> ${musicName}</p>
          <p><strong>Digital Signature:</strong> ${digitalSignature}</p>
          <p><strong>Public Key:</strong> ${publicKey}</p>
          <p><strong>Email:</strong> ${certificate}</p>
        `,
      });

      // Tự động lấy email từ certificate nếu cần
      const emailFromCertificate = certificate; // Nếu email đã có trong certificate, bạn có thể lấy từ đây.

      // Gửi yêu cầu xác minh chữ ký mà không cần phải nhập lại form
      const requestData = {
        digitalSignature,
        publicKey,
        user: { email: emailFromCertificate },
      };

      const response = await apiVerifySignature(requestData);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Digital signature has been successfully authenticated!",
        });

        Swal.fire({
          icon: "info",
          title: "User Information",
          html: `
            <p><strong>Verify Signature:</strong> ${response?.data.result.signatureValid}</p>
          `,
        });
      } else if (response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: response.data.error,
        });
      }
    } catch (error) {
      setMusicInfo(null);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
      });
    }
  };

  return (
    <>
      <div className="p-4 flex flex-col gap-3">
        <div className="w-full shadow p-4 rounded-[6px] bg-white flex flex-col gap-4">
          <div className="text-[#000] font-medium text-[17px] mb-0 hidden sm:block">
            Verify Digital Signature in Music File
          </div>

          {/* Upload File */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold">Upload Music File</label>
              <input
                type="file"
                accept="audio/mpeg, audio/wav"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <button
              onClick={handleFileVerify}
              className="bg-[#000] text-white p-2 rounded-md "
            >
              Verify File
            </button>
          </div>

          {/* Display Signature Information */}
          {musicInfo && (
            <div className="p-4 mt-4 border rounded-md bg-gray-100 leading-6">
              <h4 className="text-lg font-semibold mb-2">Music Information:</h4>
              <p>
                <strong className=" font-medium">Digital Signature:</strong>{" "}
                {musicInfo.digitalSignature}
              </p>
              <p>
                <strong className=" font-medium">Public Key:</strong>{" "}
                {musicInfo.publicKey}
              </p>
              <p>
                <strong className=" font-medium">Email:</strong>{" "}
                {musicInfo.certificate}
              </p>
              <p>
                <strong className=" font-medium">Music Name:</strong>{" "}
                {musicInfo.musicName}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DigitalSignature;
