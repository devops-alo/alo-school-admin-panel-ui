import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import styles from './Header.module.css'
import logo from '../assets/aloschoolimages/logo1.png'
import { IoPieChart } from "react-icons/io5";
import { IoPieChartOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { RiFileList2Line } from "react-icons/ri";
import { PiFlagPennantLight } from "react-icons/pi";
import { RiSettings5Line } from "react-icons/ri";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FaGraduationCap, FaImages } from "react-icons/fa";
import { FaBullseye } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FaExclamationCircle } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { MdTaskAlt } from "react-icons/md";
import { MdOutlineTaskAlt } from "react-icons/md";
import { MdWork, MdOutlineWork } from "react-icons/md";
import { RiPresentationFill, RiPresentationLine } from "react-icons/ri";
import { GoBell } from "react-icons/go";
import user_image from '../assets/user.png'
import { IoMdPerson } from "react-icons/io";
import { RiFileList2Fill } from "react-icons/ri";
import { RiStackLine, RiStackFill } from "react-icons/ri";
import { RiChatQuoteLine, RiChatQuoteFill } from "react-icons/ri";
import { PiFlagPennantFill } from "react-icons/pi";
import { RiSettings5Fill } from "react-icons/ri";
import { FaIdBadge } from "react-icons/fa";
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaMoneyBill } from "react-icons/fa";
import LogoutModal from '../sections/Logout/LogoutModal';
import { getNotification, updateNotification, markAllNotificationsRead, getNotificationCategoryCounts } from '../api/Serviceapi';
import { IoMdCloseCircle } from "react-icons/io";
import { format } from "date-fns";
import { FaRegIdBadge } from "react-icons/fa";
import { FaChevronDown, FaChevronUp,FaUserShield  } from 'react-icons/fa';
import { getUserRole, getUserPermissions } from "../sections/utils/permissions";

const SIDEBAR_ORDER = [
  "/dashboard",
  "/course",
  "/batch",
  "/tasks",
  "/tasks/settings",
  "/students",
  "/attendence",
  "/attendence/leaverequest",
  "/academic",
  "/daily-quotes",
  "/fees",
  "/complaint",
  "/harassment",
  "/enquiry/aloschool",
  "/enquiry/littlesteps",
  "/events",
  "/addevent",
  "/application",
  "/placement",
  "/workshop",
  "/studentwork",
  "/alumniimages",
  "/subadmin-management",
  "/settings",
];

const SIDEBAR_GROUPS = [
  {
    label: "Task Management",
    parentRoutes: ["/task", "/tasks"],
    children: [
      { label: "Task List", route: "/tasks" },
      { label: "Task Settings", route: "/tasks/settings" },
    ],
  },
  {
    label: "Student Management",
    parentRoutes: [
      "/students",
      "/student",
      "/attendence",
      "/attendance",
      "/academic",
    ],
    children: [
      { label: "Students", route: "/students" },
      { label: "Attendance", route: "/attendence" },
      { label: "Leave Management", route: "/attendence/leaverequest" },
      { label: "Academic", route: "/academic" },
    ],
  },
  {
    label: "Enquiry & Complaints",
    parentRoutes: ["/enquiry", "/complaint", "/harassment"],
    children: [
      { label: "Complaint", route: "/complaint" },
      { label: "Harassment", route: "/harassment" },
      { label: "ALO School Enquiry", route: "/enquiry/aloschool" },
      { label: "ALO LittleSteps Enquiry", route: "/enquiry/littlesteps" },
    ],
  },
  {
    label: "Events",
    parentRoutes: ["/events", "/addevent"],
    children: [
      { label: "Student Panel Events", route: "/events" },
      { label: "Website Event Images", route: "/addevent" },
    ],
  },
];

const Header = ({ setLoginUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
 
const userRole = getUserRole();
const permissions = getUserPermissions();
const getSidebarIcon = (route, isActive) => {
  const normalizedRoute = route.replace(/\/+$/, "").toLowerCase();

  switch (normalizedRoute) {
    case "/dashboard":
      return isActive ? <IoPieChart /> : <IoPieChartOutline />;

    case "/course":
      return isActive ? <RiFileList2Fill /> : <RiFileList2Line />;

    case "/batch":
      return isActive ? <RiStackFill /> : <RiStackLine />;

    case "/tasks":
    case "/task":
      return isActive ? <MdTaskAlt /> : <MdOutlineTaskAlt />;

    case "/tasks/settings":
      return isActive ? <RiSettings5Fill /> : <RiSettings5Line />;

    case "/students":
    case "/student":
      return isActive ? <IoMdPerson /> : <BsPerson />;

    case "/attendence":
    case "/attendance":
      return isActive ? <IoMdPerson /> : <BsPerson />;

    case "/attendence/leaverequest":
      return isActive ? <FaExclamationCircle /> : <FaRegCommentDots />;

    case "/academic":
      return isActive ? <RiFileList2Fill /> : <RiFileList2Line />;

    case "/daily-quotes":
      return isActive ? <RiChatQuoteFill /> : <RiChatQuoteLine />;

    case "/fees":
      return isActive ? <FaMoneyBill /> : <LiaMoneyBillSolid />;

    case "/complaint":
    case "/harassment":
    case "/enquiry":
    case "/enquiry/aloschool":
    case "/enquiry/littlesteps":
      return isActive ? <FaExclamationCircle /> : <FaRegCommentDots />;

    case "/events":
case "/addevent":
      return isActive ? <PiFlagPennantFill /> : <PiFlagPennantLight />;

    case "/application":
      return isActive ? <FaIdBadge /> : <FaRegIdBadge />;

    case "/placement":
      return isActive ? <MdWork /> : <MdOutlineWork />;

    case "/workshop":
      return isActive ? <RiPresentationFill /> : <RiPresentationLine />;

    case "/subadmin-management":
      return <FaUserShield />;

    case "/settings":
      return isActive ? <RiSettings5Fill /> : <RiSettings5Line />;

    case "/studentwork":
      return isActive ? <FaGraduationCap /> : <FaGraduationCap />;

    case "/alumniimages":
      return isActive ? <FaImages /> : <FaImages />;

    default:
      return null;
  }
};
const hasParentPermission = (parentRoutes) => {
  // Super Admin can see all sidebar groups
  if (userRole === "super-admin") {
    return true;
  }

  return permissions.some((permission) => {
    const route = permission.route?.replace(/\/+$/, "").toLowerCase();

    return (
      parentRoutes.some(
        (parentRoute) =>
          parentRoute.replace(/\/+$/, "").toLowerCase() === route,
      ) &&
      (userRole === "admin" || permission.actions?.includes("view"))
    );
  });
};
  const hasAttendancePermission = () =>
    permissions.some((permission) => {
      const route = permission.route?.replace(/\/+$/, "").toLowerCase();

      return (
        ["/attendance", "/attendence"].includes(route) &&
        (userRole === "admin" || permission.actions?.includes("view"))
      );
    });
const getValidUserId = () => {
  const userId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (!userId || userId === "undefined" || userId === "null") {
    return null;
  }

  return userId.trim() || null;
};


const normalizeRoute = (route = "") => route.replace(/\/+$/, "").toLowerCase();
const getPermissionOrder = (route) => {
  const normalizedRoute = normalizeRoute(route);

  const permission = permissions.find(
    (item) => normalizeRoute(item.route) === normalizedRoute,
  );

  const order = Number(permission?.order);

  return permission?.order !== undefined &&
    permission?.order !== null &&
    permission?.order !== "" &&
    Number.isFinite(order)
    ? order
    : Infinity;
};

const assignedRoutes =
  userRole === "super-admin"
    ? []
    : permissions
        .filter(
          (permission) =>
            permission.route &&
            (userRole === "admin" ||
              (userRole === "sub-admin" &&
                Array.isArray(permission.actions) &&
                permission.actions.includes("view"))),
        )
        .sort((a, b) => {
          const orderA = Number(a.order);
          const orderB = Number(b.order);

          const validOrderA =
            a.order !== undefined &&
            a.order !== null &&
            a.order !== "" &&
            Number.isFinite(orderA);

          const validOrderB =
            b.order !== undefined &&
            b.order !== null &&
            b.order !== "" &&
            Number.isFinite(orderB);

          if (validOrderA && validOrderB) {
            return orderA - orderB;
          }

          if (validOrderA) return -1;
          if (validOrderB) return 1;

          return 0;
        });

const firstAllowedRoute = assignedRoutes[0]?.route || "/login";



//  const firstAllowedRoute = subAdminRoutes[0]?.route || "/login";
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [notification, setNotification] = useState(false)
  const [notificationlist, setNotificationlist] = useState([])
  const [isread, setIsread] = useState(false)
  const [isAcademicOpen, setIsAcademicOpen] = useState(false);
// students, attendance and academic share one dropdown
  const isStudentRoute =
    location.pathname.startsWith("/students") ||
    location.pathname.startsWith("/attendence") ||
    location.pathname.startsWith("/academic");

  const [isStudentOpen, setIsStudentOpen] = useState(isStudentRoute);

  // complaint, harassment and both enquiry pages share one dropdown
  const isGrievanceRoute =
    location.pathname.startsWith("/complaint") ||
    location.pathname.startsWith("/harassment") ||
    location.pathname.startsWith("/enquiry");

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(isGrievanceRoute);

  const [isTaskOpen, setIsTaskOpen] = useState(() =>
    location.pathname.startsWith("/tasks"),
  );

  // Events and Add Event dropdown
  const isEventsRoute =
    location.pathname.startsWith("/events") ||
    location.pathname.startsWith("/addevent");

  const [isEventsOpen, setIsEventsOpen] = useState(isEventsRoute);

  useEffect(() => {
    if (isEventsRoute) {
      setIsEventsOpen(true);
    }
  }, [location.pathname]);

  const notificationRef = useRef(null);

  const handleToggleNavbar = () => {
    setIsNavbarOpen(true);
  };

  const handleCloseNavbar = () => {
    setIsNavbarOpen(false);
  };
  useLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      // Update both width and navbar state in sync
      setWindowWidth(width);

      if (width > 768 && isNavbarOpen) {
        setIsNavbarOpen(false); // Close on desktop
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial check on mount
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isNavbarOpen]);

  const [isLogoutOpen, setIsLogutOpen] = useState(false);


 


const handleLogout = () => {
  // Close the modal immediately
  setIsLogutOpen(false);

  // Clear authentication data
  const authKeys = [
    "authToken",
    "userId",
    "username",
    "userRole",
    "permissions",
  ];

  authKeys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });

  // Clear saved filters
  const filterKeys = [
    "att_courseId",
    "att_batchId",
    "att_status",
    "att_date",
    "att_searchText",
    "activestatus",
    "status",
    "courseId",
    "batchId",
    "searchText",
    "studentActiveStatus",
    "studentStatus",
    "studentCourseId",
    "studentBatchId",
    "studentSearchText",
    "studentPage",
  ];

  filterKeys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });

  // Update authentication state
  setLoginUser(false);

  // Replace the current URL with login
  navigate("/login", { replace: true });
};




  let userName = localStorage.getItem('username');

 useEffect(() => {

  if (userRole !== "sub-admin") {
    notificationget();
    fetchCategoryCounts();

    const interval = setInterval(() => {
      notificationget();
      fetchCategoryCounts();
    }, 60000);

    return () => clearInterval(interval);
  }

}, [userRole]);

  const [count, setCount] = useState(0)
  // Per-sidebar-section unread counts (Leave Management, Complaint,
  // Harassment, both Enquiry types) - independent of `count` above, which
  // is the bell icon's all-categories total.
  const [categoryCounts, setCategoryCounts] = useState({
    leave: 0,
    complaint: 0,
    harassment: 0,
    "enquiry-aloschool": 0,
    "enquiry-littlesteps": 0,
  });
  const enquiryTotalCount =
    categoryCounts.complaint +
    categoryCounts.harassment +
    categoryCounts["enquiry-aloschool"] +
    categoryCounts["enquiry-littlesteps"];

  let notificationget = async () => {
    try {
      
      const res = await getNotification();
      setNotificationlist(res?.data?.data?.data);
      // console.log(res?.data?.data?.fetchCount, 'ddd')
      setCount(res?.data?.data?.fetchCount)
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

  }

  let fetchCategoryCounts = async () => {
    try {
      const res = await getNotificationCategoryCounts();
      if (res?.data?.data) setCategoryCounts(res.data.data);
    } catch (error) {
      console.error('Error fetching notification category counts:', error);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      // If notification is open AND click is outside the box
      if (notification && notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotification(false);
      }
    }

    // Add listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notification]);

  // Which sidebar section a notification belongs to routes it after read;
  // keep in sync with the markSectionRead calls below.
  const categoryRoutes = {
    leave: '/attendence/leaverequest',
    complaint: '/complaint',
    harassment: '/harassment',
    'enquiry-aloschool': '/enquiry/aloschool',
    'enquiry-littlesteps': '/enquiry/littlesteps',
  };

  let updatenotification = async (item) => {
    try {
      await updateNotification(item?._id, true);
      navigate(categoryRoutes[item?.category] || categoryRoutes.leave);
      setNotification(false);
      notificationget();
      // The bell list only marks the one clicked notification read, but the
      // sidebar badge (categoryCounts) is separate state - refresh it too so
      // clicking a notification also clears its section's unread count.
      fetchCategoryCounts();
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  // Landing on a sidebar section's route is treated as "seen" for that
  // section's badge - clear it immediately (optimistic) and mark its
  // notifications read on the server, scoped to just that category so
  // visiting one section doesn't clear the others' badges too. This is
  // keyed off the route itself (not a specific onClick) so it clears
  // regardless of how the user got there - the sidebar link, the
  // Attendance page's "Leave Requests" card arrow, a bell notification
  // click, a direct URL, browser back/forward, etc.
  useEffect(() => {
    const category = Object.keys(categoryRoutes).find(
      (key) => categoryRoutes[key] === location.pathname
    );
    if (!category || userRole === 'sub-admin') return;
    if (!categoryCounts[category]) return; // already 0, nothing to clear

    setCategoryCounts((prev) => ({ ...prev, [category]: 0 }));
    markAllNotificationsRead('admin', category)
      .then(() => {
        notificationget();
        fetchCategoryCounts();
      })
      .catch((error) => console.error('Error marking notifications as read:', error));
  }, [location.pathname]);

  const handleLeaveManagementClick = () => navigate('/attendence/leaverequest');
  const handleComplaintClick = () => navigate('/complaint');
  const handleHarassmentClick = () => navigate('/harassment');
  const handleEnquiryAloSchoolClick = () => navigate('/enquiry/aloschool');
  const handleEnquiryLittleStepsClick = () => navigate('/enquiry/littlesteps');


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    const year = date.getUTCFullYear();
    return { day, month, year };
  };



  return (
    <>
      <div className={styles.aloschool}>
        <div className={styles.menu_toggle} onClick={handleToggleNavbar}>
          <IoMenu />
        </div>
        <div
          className={`${styles.navbar} ${windowWidth <= 768 ? (isNavbarOpen ? styles.open : styles.closed) : ""}`}
        >
          <div className={styles.navbar_close} onClick={handleCloseNavbar}>
            <IoMdClose />
          </div>
          <div className={styles.navbar_content}>
            <div>
              <div className={styles.logo}>
                <Link
                  to={
                    userRole === "super-admin"
                      ? "/dashboard"
                      : firstAllowedRoute
                  }
                >
                  <img
                    src={logo}
                    alt="logo"
                    height={"100%"}
                    width={"100%"}
                    style={{
                      filter: "brightness(0) saturate(100%) invert(100%)",
                    }}
                  />
                </Link>
              </div>
            </div>
            <div className={styles.main_navigation}>
              <div className={styles.navigation}>
                {userRole === "super-admin" && (
                  <>
                    {/* Admin Navigation */}
                    <div className={styles.dashboard}>
                      <button
                        className={`${styles.dashboard_button} ${location.pathname == "/dashboard" ? styles.navactive : ""}`}
                        onClick={() => navigate("/dashboard")}
                      >
                        {location.pathname == "/dashboard" ? (
                          <IoPieChart className={styles.filled_chart_icon} />
                        ) : (
                          <IoPieChartOutline
                            className={styles.outline_chart_icon}
                          />
                        )}
                        Dashboard
                      </button>
                    </div>
                    <div className={styles.attendance}>
                      <button
                        className={`${styles.attendance_button} ${location.pathname == "/course" || location.pathname.startsWith("/course/coursedetails") ? styles.navactive : ""}`}
                        onClick={() => navigate("/course")}
                      >
                        {location.pathname == "/course" ||
                        location.pathname.startsWith(
                          "/course/coursedetails",
                        ) ? (
                          <RiFileList2Fill
                            className={styles.filled_list_icon}
                          />
                        ) : (
                          <RiFileList2Line
                            className={styles.outline_list_icon}
                          />
                        )}
                        Course
                      </button>
                    </div>
                    <div className={styles.attendance}>
                      <button
                        className={`${styles.attendance_button} ${location.pathname.startsWith("/batch") ? styles.navactive : ""}`}
                        onClick={() => navigate("/batch")}
                      >
                        {location.pathname.startsWith("/batch") ? (
                          <RiStackFill className={styles.filled_list_icon} />
                        ) : (
                          <RiStackLine className={styles.outline_list_icon} />
                        )}
                        Batch
                      </button>
                    </div>
                    {hasParentPermission(["/task", "/tasks"]) && (
                      <div className={styles.settings}>
                        <button
                          className={`${styles.settings_button} ${
                            location.pathname.startsWith("/tasks")
                              ? styles.navactive
                              : ""
                          }`}
                          onClick={() => setIsTaskOpen(!isTaskOpen)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {location.pathname.startsWith("/tasks") ? (
                              <MdTaskAlt
                                className={styles.filled_settings_icon}
                              />
                            ) : (
                              <MdOutlineTaskAlt
                                className={styles.outline_settings_icon}
                              />
                            )}
                            Task Management
                          </div>

                          {isTaskOpen ? (
                            <FaChevronUp size={12} />
                          ) : (
                            <FaChevronDown size={12} />
                          )}
                        </button>

                        {isTaskOpen && (
                          <div className={styles.submenu}>
                            <button
                              className={`${styles.settings_button} text-sm ${
                                location.pathname === "/tasks"
                                  ? styles.navactive
                                  : ""
                              }`}
                              onClick={() => navigate("/tasks")}
                            >
                              Task List
                            </button>

                            <button
                              className={`${styles.settings_button} text-sm ${
                                location.pathname === "/tasks/settings"
                                  ? styles.navactive
                                  : ""
                              }`}
                              onClick={() => navigate("/tasks/settings")}
                            >
                              Task Settings
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          isStudentRoute ? styles.navactive : ""
                        }`}
                        onClick={() => setIsStudentOpen(!isStudentOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isStudentRoute ? (
                            <IoMdPerson className={styles.filled_person_icon} />
                          ) : (
                            <BsPerson className={styles.outline_person_icon} />
                          )}
                          Student Management
                          {!isStudentOpen && categoryCounts.leave > 0 && (
                            <span className={styles.countBadge}>
                              {categoryCounts.leave}
                            </span>
                          )}
                        </div>

                        {isStudentOpen ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>

                      {isStudentOpen && (
                        <div className={styles.submenu}>
                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/students")
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/students")}
                          >
                            Students
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/attendence") &&
                              !location.pathname.startsWith(
                                "/attendence/leaverequest",
                              )
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/attendence")}
                          >
                            Attendance
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith(
                                "/attendence/leaverequest",
                              )
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleLeaveManagementClick}
                          >
                            Leave Management
                            {categoryCounts.leave > 0 && (
                              <span
                                className={`${styles.countBadge} ${styles.countBadgeRight}`}
                              >
                                {categoryCounts.leave}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/academic")
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/academic")}
                          >
                            Academic
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.settings}>
                      <button
                        type="button"
                        className={`${styles.settings_button} ${
                          location.pathname.startsWith("/daily-quotes")
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/daily-quotes")}
                      >
                        {getSidebarIcon(
                          "/daily-quotes",
                          location.pathname.startsWith("/daily-quotes"),
                        )}
                        <span>Daily Quotes</span>
                      </button>
                    </div>
                    <div className={styles.fees}>
                      <button
                        className={`${styles.fees_button} ${location.pathname == "/fees" ? styles.navactive : ""}`}
                        onClick={() => navigate("/fees")}
                      >
                        {location.pathname == "/fees" ? (
                          <FaMoneyBill />
                        ) : (
                          <LiaMoneyBillSolid
                            className={styles.outline_fee_icon}
                          />
                        )}
                        Fee Management
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          isGrievanceRoute ? styles.navactive : ""
                        }`}
                        onClick={() => setIsEnquiryOpen(!isEnquiryOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isGrievanceRoute ? (
                            <FaExclamationCircle
                              className={styles.filled_settings_icon}
                            />
                          ) : (
                            <FaRegCommentDots
                              className={styles.outline_settings_icon}
                            />
                          )}
                          Enquiry &amp; Complaints
                          {!isEnquiryOpen && enquiryTotalCount > 0 && (
                            <span className={styles.countBadge}>
                              {enquiryTotalCount}
                            </span>
                          )}
                        </div>

                        {isEnquiryOpen ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>

                      {isEnquiryOpen && (
                        <div className={styles.submenu}>
                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/complaint"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleComplaintClick}
                          >
                            Complaint
                            {categoryCounts.complaint > 0 && (
                              <span
                                className={`${styles.countBadge} ${styles.countBadgeRight}`}
                              >
                                {categoryCounts.complaint}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/harassment"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleHarassmentClick}
                          >
                            Harassment
                            {categoryCounts.harassment > 0 && (
                              <span
                                className={`${styles.countBadge} ${styles.countBadgeRight}`}
                              >
                                {categoryCounts.harassment}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/enquiry/aloschool"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleEnquiryAloSchoolClick}
                          >
                            ALO School Enquiry
                            {categoryCounts["enquiry-aloschool"] > 0 && (
                              <span
                                className={`${styles.countBadge} ${styles.countBadgeRight}`}
                              >
                                {categoryCounts["enquiry-aloschool"]}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/enquiry/littlesteps"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleEnquiryLittleStepsClick}
                          >
                            ALO LittleSteps Enquiry
                            {categoryCounts["enquiry-littlesteps"] > 0 && (
                              <span
                                className={`${styles.countBadge} ${styles.countBadgeRight}`}
                              >
                                {categoryCounts["enquiry-littlesteps"]}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.settings}>
                      <button
                        type="button"
                        className={`${styles.settings_button} ${
                          isEventsRoute ? styles.navactive : ""
                        }`}
                        onClick={() => setIsEventsOpen((prev) => !prev)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isEventsRoute ? (
                            <PiFlagPennantFill />
                          ) : (
                            <PiFlagPennantLight />
                          )}
                          <span>Events</span>
                        </div>

                        {isEventsOpen ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>

                      {isEventsOpen && (
                        <div className={styles.submenu}>
                          <button
                            type="button"
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/events"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => {
                              navigate("/events");
                              setIsNavbarOpen(false);
                            }}
                          >
                            
                            <span>Student Panel Events</span>
                          </button>

                          <button
                            type="button"
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/addevent"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => {
                              navigate("/addevent");
                              setIsNavbarOpen(false);
                            }}
                          >
                            {/* <PiFlagPennantLight /> */}
                            <span>Website Event Images</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${location.pathname == "/application" ? styles.navactive : ""}`}
                        onClick={() => navigate("/application")}
                      >
                        {location.pathname == "/application" ? (
                          <FaIdBadge className={styles.outline_settings_icon} />
                        ) : (
                          <FaRegIdBadge
                            className={styles.filled_settings_icon}
                          />
                        )}
                        Application
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${location.pathname.startsWith("/placement") ? styles.navactive : ""}`}
                        onClick={() => navigate("/placement")}
                      >
                        {location.pathname.startsWith("/placement") ? (
                          <MdWork className={styles.filled_settings_icon} />
                        ) : (
                          <MdOutlineWork
                            className={styles.outline_settings_icon}
                          />
                        )}
                        Placement Management
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${location.pathname.startsWith("/workshop") ? styles.navactive : ""}`}
                        onClick={() => navigate("/workshop")}
                      >
                        {location.pathname.startsWith("/workshop") ? (
                          <RiPresentationFill
                            className={styles.filled_settings_icon}
                          />
                        ) : (
                          <RiPresentationLine
                            className={styles.outline_settings_icon}
                          />
                        )}
                        Workshop
                      </button>
                    </div>

                    {/* Student Work */}
                    <div className={styles.settings}>
                      <button
                        type="button"
                        className={`${styles.settings_button} ${
                          location.pathname.startsWith("/studentwork")
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/studentwork")}
                      >
                        <FaGraduationCap size={17} />
                        <span>Student Work</span>
                      </button>
                    </div>

                    {/* Alumni Images */}
                    <div className={styles.settings}>
                      <button
                        type="button"
                        className={`${styles.settings_button} ${
                          location.pathname.startsWith("/alumniimages")
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/alumniimages")}
                      >
                        <FaImages size={17} />
                        <span>Alumni Images</span>
                      </button>
                    </div>

                    <div className={styles.settings}>
                      <button
                        type="button"
                        className={`${styles.settings_button} ${
                          location.pathname.startsWith("/subadmin-management")
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/subadmin-management")}
                      >
                        <FaUserShield size={17} />
                        <span>Subadmin Management</span>
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        type="button"
                        className={`${styles.settings_button} ${
                          location.pathname.startsWith("/settings")
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/settings")}
                      >
                        {getSidebarIcon(
                          "/settings",
                          location.pathname.startsWith("/settings"),
                        )}
                        <span>Settings</span>
                      </button>
                    </div>
                  </>
                )}

                {/* {userRole === "sub-admin" && (
                  <>
                    {subAdminRoutes.map((permission) => {
                      const route = permission.route.replace(/\/+$/, "");
                      const isActive =
                        location.pathname.toLowerCase() ===
                          route.toLowerCase() ||
                        location.pathname
                          .toLowerCase()
                          .startsWith(`${route.toLowerCase()}/`);

                      return (
                        <div className={styles.settings} key={route}>
                          <button
                            type="button"
                            className={`${styles.settings_button} ${
                              isActive ? styles.navactive : ""
                            }`}
                            onClick={() => {
                              navigate(route);
                              setIsNavbarOpen(false);
                            }}
                          >
                            <span>
                              {permission.label ||
                                route
                                  .split("/")
                                  .filter(Boolean)
                                  .pop()
                                  .replace(/-/g, " ")
                                  .replace(/\b\w/g, (char) =>
                                    char.toUpperCase(),
                                  )}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </>
                )} */}
                {(userRole === "admin" || userRole === "sub-admin") && (
                  <>
                    {/* Grouped sidebar menus */}
                    {SIDEBAR_GROUPS.map((group) => {
                      const hasPermission = hasParentPermission(
                        group.parentRoutes,
                      );

                      if (!hasPermission) return null;

                      const isTaskGroup = group.label === "Task Management";
                      const isStudentGroup =
                        group.label === "Student Management";
                      const isEnquiryGroup =
                        group.label === "Enquiry & Complaints";
                      const isEventsGroup = group.label === "Events";

                      const isOpen = isTaskGroup
                        ? isTaskOpen
                        : isStudentGroup
                          ? isStudentOpen
                          : isEnquiryGroup
                            ? isEnquiryOpen
                            : isEventsGroup
                              ? isEventsOpen
                              : false;

                      const toggleGroup = () => {
                        if (isTaskGroup) {
                          setIsTaskOpen((prev) => !prev);
                        } else if (isStudentGroup) {
                          setIsStudentOpen((prev) => !prev);
                        } else if (isEnquiryGroup) {
                          setIsEnquiryOpen((prev) => !prev);
                        } else if (isEventsGroup) {
                          setIsEventsOpen((prev) => !prev);
                        }
                      };

                      return (
                        <div
                          className={styles.settings}
                          key={group.label}
                          style={{
                            order: Math.min(
                              ...group.children.map((child) =>
                                getPermissionOrder(child.route),
                              ),
                            ),
                          }}
                        >
                          <button
                            type="button"
                            className={`${styles.settings_button} ${
                              group.children.some(
                                (child) =>
                                  location.pathname.toLowerCase() ===
                                    child.route.toLowerCase() ||
                                  location.pathname
                                    .toLowerCase()
                                    .startsWith(
                                      `${child.route.toLowerCase()}/`,
                                    ),
                              )
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={toggleGroup}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {getSidebarIcon(
                                isTaskGroup
                                  ? "/tasks"
                                  : isStudentGroup
                                    ? "/students"
                                    : isEnquiryGroup
                                      ? "/complaint"
                                      : "/events",
                                isTaskGroup
                                  ? location.pathname.startsWith("/tasks")
                                  : isStudentGroup
                                    ? isStudentRoute
                                    : isEnquiryGroup
                                      ? isGrievanceRoute
                                      : isEventsRoute,
                              )}

                              <span>{group.label}</span>
                            </div>

                            {isOpen ? (
                              <FaChevronUp size={12} />
                            ) : (
                              <FaChevronDown size={12} />
                            )}
                          </button>

                          {isOpen && (
                            <div className={styles.submenu}>
                              {[...group.children]
                                .sort(
                                  (a, b) =>
                                    getPermissionOrder(a.route) -
                                    getPermissionOrder(b.route),
                                )
                                .filter((child) => {
                                  const route = child.route
                                    .replace(/\/+$/, "")
                                    .toLowerCase();

                                  const hasViewPermission = (routes) =>
                                    permissions.some((permission) => {
                                      const permittedRoute = permission.route
                                        ?.replace(/\/+$/, "")
                                        .toLowerCase();

                                      return (
                                        routes.includes(permittedRoute) &&
                                        (userRole === "admin" ||
                                          permission.actions?.includes("view"))
                                      );
                                    });

                                  // Task Management
                                  if (group.label === "Task Management") {
                                    return true;
                                  }

                                  // Student Management
                                  if (group.label === "Student Management") {
                                    if (route === "/students") {
                                      return hasViewPermission([
                                        "/students",
                                        "/student",
                                      ]);
                                    }

                                    if (route === "/attendence") {
                                      return hasViewPermission([
                                        "/attendence",
                                        "/attendance",
                                      ]);
                                    }

                                    // Attendance permission also shows Leave Management
                                    if (route === "/attendence/leaverequest") {
                                      return hasAttendancePermission();
                                    }

                                    if (route === "/academic") {
                                      return hasViewPermission(["/academic"]);
                                    }

                                    return false;
                                  }

                                  // Enquiry & Complaints
                                  // Enquiry & Complaints
                                  if (group.label === "Enquiry & Complaints") {
                                    // /enquiry parent permission shows both enquiry pages
                                    if (
                                      route === "/enquiry/aloschool" ||
                                      route === "/enquiry/littlesteps"
                                    ) {
                                      return (
                                        hasViewPermission(["/enquiry"]) ||
                                        hasViewPermission([route])
                                      );
                                    }

                                    // Complaint and Harassment use their individual permissions
                                    return hasViewPermission([route]);
                                  }

                                  // Events
                                  if (group.label === "Events") {
                                    return hasViewPermission([route]);
                                  }

                                  return false;
                                })
                                .map((child) => {
                                  const childRoute = child.route
                                    .replace(/\/+$/, "")
                                    .toLowerCase();

                                  const currentRoute = location.pathname
                                    .replace(/\/+$/, "")
                                    .toLowerCase();

                                  const isActive =
                                    currentRoute === childRoute ||
                                    currentRoute.startsWith(`${childRoute}/`);

                                  return (
                                    <button
                                      type="button"
                                      key={child.route}
                                      className={`${styles.settings_button} text-sm ${
                                        isActive ? styles.navactive : ""
                                      }`}
                                      onClick={() => {
                                        navigate(child.route);
                                        setIsNavbarOpen(false);
                                      }}
                                    >
                                      {/* {getSidebarIcon(child.route, isActive)} */}
                                      <span>{child.label}</span>
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Individual routes outside the groups */}
                    {assignedRoutes
                      .filter((permission) => {
                        const route = permission.route
                          ?.replace(/\/+$/, "")
                          .toLowerCase();

                        return !SIDEBAR_GROUPS.some((group) =>
                          group.parentRoutes.some(
                            (parentRoute) =>
                              parentRoute.replace(/\/+$/, "").toLowerCase() ===
                              route,
                          ),
                        );
                      })
                      .map((permission) => {
                        const route = permission.route.replace(/\/+$/, "");

                        const isActive =
                          location.pathname.toLowerCase() ===
                            route.toLowerCase() ||
                          location.pathname
                            .toLowerCase()
                            .startsWith(`${route.toLowerCase()}/`);

                        return (
                          <div
                            className={styles.settings}
                            key={route}
                            style={{ order: getPermissionOrder(route) }}
                          >
                            <button
                              type="button"
                              className={`${styles.settings_button} ${
                                isActive ? styles.navactive : ""
                              }`}
                              onClick={() => {
                                navigate(route);
                                setIsNavbarOpen(false);
                              }}
                            >
                              {getSidebarIcon(route, isActive)}
                              <span>
                                {permission.label ||
                                  route
                                    .split("/")
                                    .filter(Boolean)
                                    .pop()
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase(),
                                    )}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div
              className={styles.login_details}
              style={{ marginLeft: "auto" }}
            >
              <div
                className={styles.userdetails}
                onClick={() => setIsLogutOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className={styles.user_image}
                  style={{ cursor: "pointer" }}
                >
                  <img src={user_image} alt="" height={"100%"} width={"100%"} />
                </div>
                <div className={styles.user_name}>
                  <p
                    className={styles.admin_user}
                    style={{ cursor: "pointer" }}
                  >
                    {userName}
                  </p>
                  <p className={styles.user_role}>
                    {userRole === "super-admin"
                      ? "Super Admin"
                      : userRole === "admin"
                        ? "Admin"
                        : userRole === "sub-admin"
                          ? "Sub Admin"
                          : "User"}
                  </p>
                </div>
              </div>
              {userRole !== "sub-admin" && (
                <button
                  type="button"
                  className={`${styles.notification_icon} ${count > 0 ? styles.hasUnread : ""}`}
                  onClick={() =>
                    Array.isArray(notificationlist) &&
                    notificationlist.length > 0 &&
                    setNotification(!notification)
                  }
                  aria-label="Notifications"
                >
                  <GoBell />
                  {count > 0 && <span className={styles.dot}></span>}
                </button>
              )}
              <button
                type="button"
                className={styles.notification_icon}
                onClick={() => setIsLogutOpen(true)}
                aria-label="Logout"
                title="Logout"
              >
                <RiLogoutCircleLine />
              </button>
            </div>
          </div>

          <div
            className={styles.Outlet}
            style={{ flex: 1, minHeight: 0, overflow: "auto" }}
          >
            <Outlet />
          </div>
        </div>
      </div>

      {isLogoutOpen && (
        <LogoutModal
          onConfirmLogout={handleLogout}
          closeModal={() => setIsLogutOpen(false)}
        />
      )}
      {notification && (
        <div className={styles.notification}>
          <div ref={notificationRef} className={styles.notification_content}>
            <div className={styles.notification_header}>
              <p className={styles.notification_title}>Notifications</p>
              <span
                className={styles.notification_close}
                onClick={() => setNotification(false)}
              >
                <IoMdCloseCircle />
              </span>
            </div>
            <div className={styles.notification_scrollArea}>
              {notificationlist.map((item, index) => {
                const { day, month, year } = formatDate(item.date);
                const firstLetter = item.message?.charAt(0).toUpperCase(); // Get first letter

                return (
                  <div
                    key={item?._id || index}
                    className={styles.notification_box}
                    onClick={() => {
                      updatenotification(item);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold">
                          {firstLetter}
                        </div>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            textTransform: "capitalize",
                          }}
                          className={`${item.isRead ? "" : styles.notification_read}`}
                        >
                          {item.message}
                        </p>

                        <span className="text-xs text-gray-400">
                          {day} {month} {year}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;