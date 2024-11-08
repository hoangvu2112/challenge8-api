const apiUrl = "https://crudnodejs-production.up.railway.app/api";
const token = localStorage.getItem("authToken");
const projectId = new URLSearchParams(window.location.search).get("id");

// Verify auth token and projectId
if (!token) {
  alert("Bạn cần đăng nhập để xem chi tiết dự án.");
  window.location.href = "/signin.html";
}
if (!projectId) {
  alert("Không tìm thấy ID dự án. Vui lòng kiểm tra URL.");
  console.error("Không tìm thấy ID dự án.");
}

// Initialization
$(document).ready(() => {
  fetchProjectDetails();
  setupEventListeners();
  searchModal();
});

// Fetch project details
async function fetchProjectDetails() {
  try {
    const response = await fetch(`${apiUrl}/projects/${projectId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      alert(`Lỗi: ${error.message || "Lỗi không xác định"}`);
      throw new Error(error.message || "Lỗi không xác định");
    }
    const projectData = await response.json();
    displayProjectDetails(projectData);
  } catch (error) {
    console.error("API Error:", error);
  }
}

// Display project details
function displayProjectDetails(project) {
  if (!project) return alert("Không tìm thấy dữ liệu dự án.");

  $(".project-form__input").eq(0).val(project.name || "");
  $(".project-form__input").eq(1).val(project.description || "");
  $(".project-form__input").eq(2).val(project.startDate || "");
  $(".project-form__input").eq(3).val(project.endDate || "");
  populateMembersTable(project.members || []);
}

// Populate members table
function populateMembersTable(members) {
  const membersTableBody = $(".project-members__table tbody");
  membersTableBody.empty();

  if (members.length === 0) {
    membersTableBody.append("<tr><td colspan='4'>Không có thành viên nào</td></tr>");
  } else {
    members.forEach((member, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${member.name || member.username || "N/A"}</td>
          <td>${member.email}</td>
          <td>
            <button class="project-members__delete-btn" data-member-id="${member.id}">🗑</button>
          </td>
        </tr>
      `;
      membersTableBody.append(row);
    });
  }
}

// Fetch and display users in modal
async function fetchUserData(query = null) {
  try {
    const searchQuery = query ? `search?q=${encodeURIComponent(query)}` : '';
    const response = await fetch(`${apiUrl}/users/${searchQuery}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const users = Array.isArray(data) ? data : data.users;

    if (Array.isArray(users) && users.length > 0) {
      populateModalTable(users);
    } else {
      alert("Không tìm thấy người dùng nào.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    alert("Không thể thực hiện tìm kiếm hoặc lấy dữ liệu.");
  }
}

let timeOut;
function searchModal() {
  $(".user-selection-modal__search").on("input", function () {
    const query = $(this).val().toLowerCase();
    clearTimeout(timeOut);

    timeOut = setTimeout(() => {
      fetchUserData(query);
    }, 500);
  });
}

// Update user pagination
function updatePagination(totalItems, currentPage, itemsPerPage, fetchDataFn) {
  // Removed pagination-related code
}

async function addUserToProject(userId) {
  if (!projectId) return alert("ID dự án không hợp lệ");

  try {
    const response = await fetch(`${apiUrl}/projects/${projectId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lỗi không xác định");
    }

    alert("Thành viên đã được thêm vào dự án!");
    closeModal();
    fetchProjectDetails();
  } catch (error) {
    console.error("Lỗi khi thêm thành viên vào dự án:", error);
    alert(`Lỗi: ${error.message}`);
  }
}

function setupEventListeners() {
  $(".project-form__button--update").on("click", updateProjectDetails);
  $(".user-selection-modal__add-btn").on("click", () => {
    if (selectedUserId) addUserToProject(selectedUserId);
    else alert("Vui lòng chọn một người dùng để thêm vào dự án.");
  });
}

// Update project details
async function updateProjectDetails() {
  const updatedData = {
    name: $(".project-form__input").eq(0).val(),
    description: $(".project-form__input").eq(1).val(),
    startDate: $(".project-form__input").eq(2).val(),
    endDate: $(".project-form__input").eq(3).val(),
  };

  try {
    const response = await fetch(`${apiUrl}/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lỗi không xác định");
    }

    alert("Cập nhật dự án thành công!");
    window.location.href = "/projectlist.html";
  } catch (error) {
    console.error("Lỗi khi cập nhật dự án:", error);
    alert(`Lỗi: ${error.message}`);
  }
}

// Modal handling
function openModal() {
  $("#userSelectionModal").css("display", "flex");
  fetchUserData();
}

function closeModal() {
  $("#userSelectionModal").css("display", "none");
  selectedUserId = null;
}

// Populate modal table with user data
function populateModalTable(users) {
  const tbody = $(".user-selection-modal__table tbody");
  tbody.empty();

  if (!Array.isArray(users)) {
    return alert("Dữ liệu người dùng không hợp lệ.");
  }

  users.forEach((user) => {
    const row = $(` 
        <tr data-user-id="${user._id}">
          <td>${user.username}</td>
          <td>${user.email}</td>
        </tr>
      `);

    row.on("click", function () {
      $("tr").removeClass("selected");
      $(this).addClass("selected");
      selectedUserId = $(this).data("user-id");
    });
    tbody.append(row);
  });
}
