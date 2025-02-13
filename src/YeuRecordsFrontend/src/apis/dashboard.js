import instance from "../axios";

export const apiGetStatisticalDashboard = () =>
  instance({
    url: `/dashboard/stats`,
    method: "get",
  });
