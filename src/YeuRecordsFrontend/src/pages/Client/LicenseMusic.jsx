import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import icons from "../../utils/icon";
import testSignature from "../../assets/images/chu-ky-ten-manh.jpg";
import { removeBackground } from "../../apis/removebg";
import removeAccents from "remove-accents";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { apiCreateLicense, uploadFileToCloudinary } from "../../apis";

const { BiExport, FaFileSignature, RiHome6Fill } = icons;

const LicenseMusic = () => {
  const contentRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [dataMusic, setDataMusic] = useState();
  const [dataArtist, setDataArtist] = useState();

  // xử lý export ra PDF
  const handleExportPDF = () => {
    const element = contentRef.current;
    const options = {
      margin: [10, 10, 10, 10],
      filename: "License_Agreement.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: element.clientWidth,
      },
      jsPDF: {
        unit: "px",
        format: [element.clientWidth, element.clientHeight],
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(options).from(element).save();
  };

  // lấy data nhạc từ localstorate để lưu vào state
  useEffect(() => {
    const savedData = localStorage.getItem("submittedMusicData");
    const data = JSON.parse(localStorage.getItem("userInfo"));

    if (savedData) {
      let data = JSON.parse(savedData);
      data?.map((value) => {
        setDataMusic(value?.musicId);
      });
    }

    if (data) {
      setDataArtist(data);
    }
  }, []);

  // lấy ra ngày hiện tại
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-GB");
  };

  // xử lý xóa nền bằng removebg
  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validFormats = ["image/jpeg", "image/png"];
      if (!validFormats.includes(file.type)) {
        toast("Invalid file format. Please upload a JPG or PNG image.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast("File size exceeds 2MB. Please upload a smaller file.");
        return;
      }
      setLoading(true);
      try {
        var imageWithNoBackground = await removeBackground(file);
        if (imageWithNoBackground) {
          setPreviewImage(imageWithNoBackground);
        }
      } catch (error) {
        if (error.status === 402) {
          setPreviewImage(URL.createObjectURL(file));
        } else {
          throw error;
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Hàm tạo file PDF từ nội dung HTML
  const generatePdfBlob = async (element) => {
    const options = {
      margin: [10, 10, 10, 10],
      filename: "License_Agreement.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: element.clientWidth,
      },
      jsPDF: {
        unit: "px",
        format: [element.clientWidth, element.clientHeight],
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Tạo Blob từ PDF
    const pdfBlob = await html2pdf().from(element).set(options).output("blob");
    return pdfBlob;
  };

  // xử lý logic phát hành nhạc
  const handleRelease = async () => {
    if (!previewImage) {
      toast.error("Please upload your signature image before publishing.");
      return;
    }

    const swalLoading = Swal.fire({
      title: "Publishing...",
      text: "Please wait while we process your files.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const element = contentRef.current;
      const pdfBlob = await generatePdfBlob(element);

      const pdfFile = new File([pdfBlob], "License_Agreement.pdf", {
        type: "application/pdf",
      });

      const pdfFileResponse = await uploadFileToCloudinary(
        pdfFile,
        "pdfLicense"
      );

      const data = {
        userId: dataArtist.userId,
        musicId: dataMusic,
        pdfUrl: pdfFileResponse.secure_url,
      };

      console.log(data);

      const response = await apiCreateLicense(data);
      if (response.status === 201) {
        toast.success("Congratulations on your successful music publishing!");
      }

      // Tạo link tải về
      const pdfDownloadLink = `${pdfFileResponse.secure_url.replace(
        "/upload/",
        "/upload/fl_attachment/"
      )}`;
      const link = document.createElement("a");
      link.href = pdfDownloadLink;
      link.download = "License_Agreement.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      swalLoading.close();
      Swal.fire({
        icon: "success",
        title: "Successfully Published!",
        text: "Your music and related files have been uploaded and processed.",
      });

      navigate("/submit-music");
    } catch (error) {
      console.error("Error during file upload:", error);
      swalLoading.close();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while uploading your files. Please try again.",
      });
    }
  };

  return (
    <div className="p-8 flex flex-col justify-center gap-3">
      <div
        ref={contentRef}
        className="bg-white p-8 border rounded-lg text-left w-[850px] min-h-[842px] overflow-auto"
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
      >
        <h1 className="text-2xl font-normal text-center mb-4">
          LICENSE AGREEMENT TO USE MUSIC
        </h1>

        <div className="font-light leading-6">
          This license agreement (hereafter referred to as the “AGREEMENT”) is
          made between the <strong>Yeu Records</strong> (hereafter referred to
          as the “LICENSEE”) and the copyright owner(s){" "}
          <strong className=" font-normal">
            "{removeAccents(dataArtist?.fullname || "")}"
          </strong>{" "}
          <strong className="font-normal"></strong>
          (hereafter referred to as the “LICENSOR”), in regards to the musical
          composition embodied in the{" "}
          <strong className=" font-normal">
            "{removeAccents(dataMusic?.musicName || "")}"
          </strong>{" "}
          (hereafter referred to as the “Work”) on the date of the signing of
          this agreement set forth below.
        </div>

        <div className="mb-4 font-bold leading-6">
          <span className="text-red-600">Note:</span>
          <span className="bg-[#59b540] font-semibold px-1 py-1 mx-1">(*)</span>
          The publisher and author need to comply with the general rules stated
          in the contract; if violated, they will be responsible before the law.
        </div>

        <h2 className="text-xl font-medium my-2 text-center">GUARANTEE</h2>
        <div className="mb-4 font-light leading-6">
          <span className="underline">LICENSOR</span> guarantees that it owns
          and controls the rights represented herein with respect to the
          recordings and the musical compositions in the{" "}
          <span className="underline">Work</span> and has and will hold
          throughout the <span className="underline">TERRITORY</span> and during
          the <span className="underline">DURATION</span> the above listed
          rights to exploit the <span className="underline">Work</span> as
          contemplated herein. <span className="underline">LICENSOR</span> will
          keep harmless <span className="underline">LICENSEE</span> from any and
          all claims or warranties made by the{" "}
          <span className="underline">LICENSOR</span> herein.
        </div>

        <h2 className="text-xl font-medium text-center mb-2">
          GENERAL TERMS - TERRITORY AND DATES
        </h2>
        <div className="leading-6">
          The rights granted to LICENSEE in this AGREEMENT:
        </div>
        <ol className="list-decimal mb-4 inline-block leading-6">
          <li className="inline mr-2">
            <span className="bg-[#59b540] font-semibold px-1 py-1 mx-1">
              (1)
            </span>
            The <span className="underline">LICENSOR</span> grants
            <span className="underline">LICENSEE</span> a perpetual license to
            use the <span className="underline">Work</span> herein.
          </li>
          <li className="inline mr-2">
            <span className="bg-[#59b540] font-semibold px-1 py-1 mx-1">
              (2)
            </span>
            The territory of this contract is applicable across all countries
            and valid only in the YouTube channel{" "}
            <a
              href="https://www.youtube.com/@YeuRecords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline ml-1"
            >
              Yeu EDM
            </a>
            .
          </li>
          <li className="inline mr-2">
            <span className="bg-[#59b540] font-semibold px-1 py-1 mx-1">
              (3)
            </span>
            The <span className="underline">LICENSOR</span> grants
            <span className="underline">LICENSEE</span> all rights to use the{" "}
            <span className="underline">Work</span> on the channel{" "}
            <strong className="underline text-blue-600">Yeu EDM</strong> without
            any restrictions.
          </li>
          <li className="inline mr-2">
            <span className="bg-[#59b540] font-semibold px-1 py-1 mx-1">
              (4)
            </span>
            The term of the contract is effective on
            <strong className="underline text-[#d34474]">
              THE DATE SIGNED BELOW
            </strong>
            .
          </li>
        </ol>

        <div className="flex flex-col items-center justify-center font-semibold leading-6">
          <div>THIS AGREEMENT IS NOT TRANSFERABLE TO ANY OTHER PARTY</div>
          <div>
            ALL RIGHTS IN THIS AGREEMENT ARE VALID ONLY IN YOUTUBE CHANNEL “Yeu
            EDM”
          </div>
          <div>
            THE CONTRACT HAS NO VALUE WHEN OUTSIDE OR NOT THE YOUTUBE CHANNEL
            "Yeu EDM"
          </div>
        </div>

        <div className="flex justify-between mt-8 leading-6">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <div className="font-bold">Full Name:</div>
              <div className=" underline font-bold"> Nguyen Thanh Hai</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-bold">Email:</div>
              <a
                href="mailto:azusa.producer@gmail.com"
                className="text-blue-600 underline font-semibold"
              >
                azusa.producer@gmail.com
              </a>
            </div>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <div className="font-bold">Full Name:</div>
              <div className="font-bold underline">
                {removeAccents(dataArtist?.fullname || "")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-bold">Email:</div>
              <a
                href={`mailto:${dataArtist?.email}`}
                className="text-blue-600 underline font-semibold"
              >
                {dataArtist?.email}
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8 leading-6">
          <div className="text-left">
            <h3 className="font-bold">LICENSOR</h3>
            <div className="flex items-center gap-2 relative">
              <div className=" absolute right-[60px] bottom-[0]">
                <img
                  src={testSignature}
                  alt="Licensee Signature"
                  className="h-[68px] w-[68px] border border-gray-300 object-contain"
                />
              </div>
              <div className="font-bold">Signature:</div>
              <div>____________________</div>
            </div>
            <div className="flex gap-2">
              <div className="font-bold">Date:</div>{" "}
              <div className=" underline">{getCurrentDate()}</div>
            </div>
          </div>
          <div className="text-left">
            <h3 className="font-bold">LICENSEE</h3>
            <div className="flex items-center gap-2 relative">
              {previewImage && (
                <div className=" absolute right-[60px] bottom-[0]">
                  <img
                    src={previewImage}
                    alt="Digital Signature Preview"
                    className="h-[68px] w-[68px] border border-gray-300 object-contain"
                  />
                </div>
              )}
              <div className="font-bold">Signature:</div>
              <div>____________________</div>
            </div>
            <div className="flex gap-2">
              <div className="font-bold">Date:</div>{" "}
              <div className=" underline">{getCurrentDate()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white shadow rounded-md">
        <h3 className="text-lg font-semibold mb-2">Signature</h3>
        <div className="flex flex-col gap-4">
          {/* Nút tải lên file chữ ký số với xem trước ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Image Signature
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
            {/* Thông báo hướng dẫn */}
            <div className="text-sm text-gray-500 mt-1">
              Please upload an image with the following requirements:
              <ul className="list-disc ml-4">
                <li>
                  Background must be white, best should be a4 paper or online
                  drawing tool
                </li>
                <li>The signature should be centered in the image.</li>
                <li>Allowed formats: JPG, PNG. Max size: 2MB.</li>
                <li>
                  Instruct:{" "}
                  <a
                    href="https://www.youtube.com/@YeuRecords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    YouTube YeuRecord
                  </a>
                </li>
              </ul>
            </div>

            {/* Xem trước ảnh chữ ký số */}
            {loading ? (
              <div className="mt-4 flex justify-center items-center">
                <div className="animate-spin rounded-full border-t-4 border-blue-500 w-12 h-12"></div>
                <span className="ml-2 text-[20px] font-medium">
                  wait a minute
                  <span className="dot">...</span>
                </span>
              </div>
            ) : (
              previewImage && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Preview:</div>
                  <img
                    src={previewImage}
                    alt="Digital Signature Preview"
                    className="h-[200px] w-[200px] mt-2 border border-gray-300 rounded-md"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          className="bg-[#000] text-white px-4 py-2 rounded-lg cursor-pointer flex justify-center items-center gap-3"
          onClick={handleRelease}
        >
          <div>
            <FaFileSignature />
          </div>
          <div>Released Now</div>
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-[#000] text-white px-4 py-2 rounded-lg cursor-pointer flex justify-center items-center gap-3"
        >
          <div>
            <BiExport />
          </div>
          <div>Export to PDF</div>
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-[#000] text-white px-4 py-2 rounded-lg cursor-pointer flex justify-center items-center gap-3"
        >
          <div>
            <RiHome6Fill />
          </div>
          <div>Home</div>
        </button>
      </div>
    </div>
  );
};

export default LicenseMusic;
