import { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { apiGetStatisticalDashboard } from "../../apis/dashboard";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const DashBoash = () => {
  const [dashboardData, setDashboardData] = useState(null);

  // Gọi API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGetStatisticalDashboard();
        if (response.status === 200) {
          setDashboardData(response.data.result);
        } else {
          console.error("Failed to fetch data", response.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchData();
  }, []);

  // Kiểm tra nếu dữ liệu chưa được tải xong
  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  // Thống kê người dùng
  const userStatsData = {
    labels: ["Online", "Offline"],
    datasets: [
      {
        data: [
          dashboardData.userStats.onlineUsers,
          dashboardData.userStats.totalUsers -
            dashboardData.userStats.onlineUsers,
        ],
        backgroundColor: ["#4CAF50", "#FF5722"],
        hoverBackgroundColor: ["#66BB6A", "#FF7043"],
      },
    ],
  };

  // Thống kê tài khoản bị khóa
  const lockedAccountsData = {
    labels: ["Locked", "Normal"],
    datasets: [
      {
        data: [
          dashboardData.lockedAccountsStats.lockedAccounts,
          dashboardData.lockedAccountsStats.totalUsers -
            dashboardData.lockedAccountsStats.lockedAccounts,
        ],
        backgroundColor: ["#FF9800", "#2196F3"],
        hoverBackgroundColor: ["#FFC107", "#64B5F6"],
      },
    ],
  };

  // Thống kê bài nhạc và album
  const combinedData = {
    labels: ["Total Music", "Total Album"],
    datasets: [
      {
        label: "Statistics",
        data: [
          dashboardData.musicAndAlbumStats.totalSongs,
          dashboardData.musicAndAlbumStats.totalAlbums,
        ],
        backgroundColor: ["#673AB7", "#009688"],
        hoverBackgroundColor: ["#9575CD", "#4DB6AC"],
      },
    ],
  };

  // Dữ liệu bài hát phát hành theo tháng
  const processMonthlyData = (apiData) => {
    const months = Array(12).fill(0);
    apiData.forEach(([month, count]) => {
      if (month >= 1 && month <= 12) {
        months[month - 1] = count;
      }
    });

    return months;
  };

  // Xử lý dữ liệu API
  const monthlySongsData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Total Music",
        data: processMonthlyData(
          dashboardData?.monthlySongsRelease.monthlyData
        ),
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="p-4 bg-gray-100 flex flex-col gap-4">
      {/* Hàng trên: Biểu đồ nhỏ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Người dùng online */}
        <div className="bg-white shadow-md rounded-lg p-2 flex flex-col items-center h-[200px]">
          <h2 className="text-sm font-medium mb-2 text-center">
            Artists Online
          </h2>
          <div className="w-[150px] mx-auto">
            <Pie data={userStatsData} />
          </div>
        </div>

        {/* Tài khoản bị khóa */}
        <div className="bg-white shadow-md rounded-lg p-2 flex flex-col items-center h-[200px]">
          <h2 className="text-sm font-medium mb-2 text-center">
            Locked Accounts
          </h2>
          <div className="w-[150px] mx-auto">
            <Pie data={lockedAccountsData} />
          </div>
        </div>

        {/* Thống kê bài nhạc và album */}
        <div className="bg-white shadow-md rounded-lg p-2 flex flex-col items-center h-[200px]">
          <h2 className="text-sm font-medium mb-2 text-center">
            Music and Album Statistics
          </h2>
          <div className="w-[200px] md:w-[250px] mx-auto">
            <Bar data={combinedData} />
          </div>
        </div>
      </div>

      {/* Hàng dưới: Biểu đồ lớn */}
      <div className="bg-white shadow-md rounded-lg flex flex-col items-center justify-center p-4">
        <h2 className="text-sm font-medium mb-4 text-center">
          Number of Songs Released (12 Months)
        </h2>
        <div className="w-full mx-auto max-w-[850px] md:h-[325px] h-[200px]">
          <Line
            data={monthlySongsData}
            options={{ maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashBoash;
