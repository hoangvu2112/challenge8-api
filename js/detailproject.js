const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");
const token = localStorage.getItem("authToken");
const apiUrl = "https://crudnodejs-production.up.railway.app/api/users";
$(document).ready(async function () {
  // Lấy projectId từ URL

  // Kiểm tra nếu projectId không tồn tại
  if (!projectId) {
    alert("Không tìm thấy ID dự án. Vui lòng kiểm tra URL.");
    console.error("Project ID is undefined.");
    return;
  }

  // Lấy authToken từ localStorage

  if (!token) {
    alert("Bạn cần đăng nhập để xem chi tiết dự án.");
    window.location.href = "/signin.html";
    return;
  }

  try {
    // Gọi API để lấy chi tiết dự án
    const response = await fetch(
      `https://crudnodejs-production.up.railway.app/api/projects/${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      alert(
        `Lỗi khi lấy chi tiết dự án: ${
          errorResponse.message || "Lỗi không xác định"
        }`
      );
      return;
    }

    // Xử lý dữ liệu chi tiết dự án
    const projectData = await response.json();
    displayProjectDetails(projectData); // Gọi hàm hiển thị chi tiết dự án
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết dự án:", error);
    alert("Có lỗi xảy ra khi lấy chi tiết dự án. Vui lòng thử lại sau.");
  }

  // Xử lý sự kiện cập nhật dự án
  $(".project-form__button--update").on("click", async function () {
    const name = $(".project-form__input").eq(0).val();
    const description = $(".project-form__input").eq(1).val();
    const startDate = $(".project-form__input").eq(2).val();
    const endDate = $(".project-form__input").eq(3).val();

    const updatedData = {
      name,
      description,
      startDate,
      endDate,
    };

    try {
      const response = await fetch(
        `https://crudnodejs-production.up.railway.app/api/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        alert(
          `Lỗi khi cập nhật dự án: ${errorResponse.message || "Không xác định"}`
        );
        return;
      }

      alert("Cập nhật dự án thành công!");
      window.location.href = "/projectlist.html";
    } catch (error) {
      console.error("Lỗi khi cập nhật dự án:", error);
      alert("Có lỗi xảy ra khi cập nhật dự án. Vui lòng thử lại sau.");
    }
  });

  let selectedUserId = null; // ID của người dùng được chọn

  // Hàm mở modal
  function openModal() {
    $("#userSelectionModal").css("display", "flex");
    fetchUserData(); // Gọi API để lấy dữ liệu người dùng khi mở modal
  }

  // Hàm đóng modal
  function closeModal() {
    $("#userSelectionModal").css("display", "none");
    selectedUserId = null; // Reset ID người dùng được chọn khi đóng modal
  }

  // Sự kiện khi nhấn nút đóng trong modal
  $(".user-selection-modal__close").on("click", closeModal);

  // Sự kiện khi nhấn vào biểu tượng thêm thành viên để mở modal
  $(".action-icon").on("click", openModal);

  // Hàm gọi API để lấy danh sách người dùng
  async function fetchUserData() {
    try {
      const response = await fetch(
        "https://crudnodejs-production.up.railway.app/api/users",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer <your_token_here>", // Thay token của bạn ở đây
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu người dùng");
      }

      const data = await response.json();
      populateModalTable(data); // Điền dữ liệu vào bảng nếu lấy dữ liệu thành công
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Không thể lấy dữ liệu người dùng");
    }
  }

  const searchInput = document.querySelector(".user-selection-modal__search");
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchUsers(query);
    } else {
      fetchUserData(); // Nếu ô tìm kiếm trống, tải lại danh sách người dùng ban đầu
    }
  });

  // Hàm để điền dữ liệu vào bảng trong modal, giới hạn chỉ 3 người
  function populateModalTable(users) {
    const tbody = $(".user-selection-modal__table");
    tbody.empty(); // Xóa các dòng cũ

    if (!Array.isArray(users)) {
      console.error("Dữ liệu không phải là mảng:", users);
      return;
    }

    // Giới hạn danh sách người dùng chỉ hiển thị 3 người
    users.slice(0, 3).forEach((user) => {
      const row = $(`
        <tr data-user-id="${user._id}">
          <td>${user.username}</td>
          <td>${user.email}</td>
        </tr>
      `);

      // Thêm sự kiện khi nhấp vào hàng để chọn người dùng
      row.on("click", function () {
        $("tr").removeClass("selected"); // Bỏ chọn hàng khác
        $(this).addClass("selected"); // Đánh dấu hàng được chọn
        selectedUserId = $(this).data("user-id"); // Lưu ID của người dùng được chọn
      });

      tbody.append(row); // Thêm dòng mới vào bảng
    });
  }

  // Sự kiện khi nhấn nút "ADD" trong modal
  $(".user-selection-modal__add-btn").on("click", function () {
    if (selectedUserId) {
      addUserToProject(selectedUserId);
    } else {
      alert("Vui lòng chọn một người dùng để thêm vào dự án.");
    }
  });
  // Hàm thêm người dùng vào dự án sử dụng fetch
  function addUserToProject(userId) {
    if (!projectId) {
      alert("ID dự án không hợp lệ");
      return;
    }

    fetch(
      `https://crudnodejs-production.up.railway.app/api/projects/${projectId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            console.error("Chi tiết lỗi từ API:", err);
            alert(
              "Không thể thêm người dùng vào dự án: " +
                (err.message || "Lỗi không xác định từ máy chủ")
            );
            throw new Error("Error adding user to project");
          });
        }
        alert("Thành viên đã được thêm vào dự án!");
        closeModal();
        fetchMemberProject();
      })
      .catch((error) => {
        alert("Không thể thêm người dùng vào dự án");
      });
  }

  async function searchUsers(query) {
    const searchUrl = `${apiUrl}/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_AUTH_TOKEN",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tìm kiếm người dùng");
      }

      const data = await response.json();
      populateModalTable(data.users);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }
});
async function fetchMemberProject() {
  try {
    // Gọi API để lấy chi tiết dự án
    const response = await fetch(
      `https://crudnodejs-production.up.railway.app/api/projects/${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Lỗi không xác định");
    }

    // Xử lý dữ liệu chi tiết dự án
    const projectData = await response.json();
    console.log("Dữ liệu dự án:", projectData);
    displayProjectDetails(projectData); // Gọi hàm hiển thị chi tiết dự án
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết dự án:", error.message);
    alert(
      `Có lỗi xảy ra khi lấy chi tiết dự án: ${error.message}. Vui lòng thử lại sau.`
    );
  }
}

// Hàm hiển thị chi tiết dự án lên trang
function displayProjectDetails(project) {
  if (!project) {
    alert("Không tìm thấy dữ liệu dự án.");
    return;
  }

  // Hiển thị tên dự án
  $(".project-form__input")
    .eq(0)
    .val(project.name || "");

  // Hiển thị mô tả dự án
  $(".project-form__input")
    .eq(1)
    .val(project.description || "");

  // Hiển thị ngày bắt đầu
  $(".project-form__input")
    .eq(2)
    .val(project.startDate || "");

  // Hiển thị ngày kết thúc
  $(".project-form__input")
    .eq(3)
    .val(project.endDate || "");

  // Hiển thị danh sách thành viên
  const membersTableBody = $(".project-members__table tbody");
  membersTableBody.empty(); // Xóa dữ liệu hiện tại nếu có

  if (project.members && project.members.length > 0) {
    project.members.forEach((member, index) => {
      const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${member.name || member.username || "N/A"}</td>
        <td>${member.email}</td>
        <td>
          <button class="project-members__delete-btn" data-member-id="${
            member.id
          }">🗑</button>
        </td>
      </tr>
    `;
      membersTableBody.append(row);
    });
  } else {
    membersTableBody.append(
      "<tr><td colspan='4'>Không có thành viên nào</td></tr>"
    );
  }
  // Chuyển hướng đến trang đăng nhập khi nhấn vào icon logout
  $(".user-info__logout-icon, .project-list-logout-icon,.user-info__icon ").on(
    "click",
    function logout() {
      localStorage.removeItem("userId");
      localStorage.removeItem("authToken");

      window.location.href = "/signin.html";
    }
  );
}

let currentPage = 1;
let usersPerPage = 10; // Giá trị mặc định lấy từ <select>
let totalUsers = 0;

// Hàm cập nhật thông tin phân trang và hiển thị các nút trang
function updatePagination() {
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const paginationPages = $(".pagination__pages");
  paginationPages.empty();

  // Hiển thị các nút trang số
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = $(`<button class="pagination__page">${i}</button>`);
    if (i === currentPage) {
      pageButton.addClass("active");
    }
    pageButton.on("click", function () {
      currentPage = i;
      fetchUserData();
    });
    paginationPages.append(pageButton);
  }

  // Cập nhật trạng thái của nút Previous và Next
  $(".pagination__prev").prop("disabled", currentPage === 1);
  $(".pagination__next").prop("disabled", currentPage === totalPages);
}

// Sự kiện cho nút Previous
$(".pagination__prev").on("click", function () {
  if (currentPage > 1) {
    currentPage--;
    fetchUserData();
  }
});

// Sự kiện cho nút Next
$(".pagination__next").on("click", function () {
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    fetchUserData();
  }
});

// Sự kiện thay đổi số lượng người dùng hiển thị trên mỗi trang
$(".pagination__page-size").on("change", function () {
  usersPerPage = parseInt($(this).val());
  currentPage = 1; // Quay về trang đầu khi thay đổi số lượng hiển thị
  fetchUserData();
});

// Cập nhật hàm fetchUserData để hỗ trợ phân trang
async function fetchUserData() {
  try {
    const response = await fetch(
      `https://crudnodejs-production.up.railway.app/api/users?page=${currentPage}&limit=${usersPerPage}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Sử dụng token của bạn
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể lấy dữ liệu người dùng");
    }

    const data = await response.json();
    totalUsers = data.total; // Tổng số người dùng, lấy từ phản hồi API
    populateModalTable(data.users); // Điền dữ liệu vào bảng nếu lấy dữ liệu thành công
    updatePagination(); // Cập nhật thông tin phân trang
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Không thể lấy dữ liệu người dùng");
  }
}

// Cập nhật hàm populateModalTable để hiển thị đúng người dùng
function populateModalTable(users) {
  const tbody = $(".user-selection-modal__table");
  tbody.empty(); // Xóa các dòng cũ

  if (!Array.isArray(users)) {
    console.error("Dữ liệu không phải là mảng:", users);
    return;
  }

  users.forEach((user) => {
    const row = $(`<tr data-user-id="${user._id}">
        <td>${user.username}</td>
        <td>${user.email}</td>
      </tr>`);

    row.on("click", function () {
      $("tr").removeClass("selected");
      $(this).addClass("selected");
      selectedUserId = $(this).data("user-id");
    });

    tbody.append(row);
  });
}
