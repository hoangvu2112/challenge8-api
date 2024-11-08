document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://crudnodejs-production.up.railway.app/api/users";
  let rowsPerPage = 6; // Số dòng trên mỗi trang
  let currentPage = 1;
  let totalUsers = 0;
  let usersData = [];

  // Kiểm tra xem có phải trang userlist không
  if (document.querySelector(".user-list__table-body")) {
    fetchUsers();
    setupNewUserButton();
  }

  const searchInput = document.querySelector(".user-list__search-input");
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchUsers(query);
    } else {
      fetchUsers(); // Nếu ô tìm kiếm trống, tải lại danh sách người dùng ban đầu
    }
  });

  // Kiểm tra xem có phải trang detailuser không
  if (document.querySelector(".detail-user__form")) {
    fetchUserDetails();
  }
  async function searchUsers(query) {
    const searchUrl = `${apiUrl}/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Thêm token nếu cần thiết
          Authorization: "Bearer YOUR_AUTH_TOKEN",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tìm kiếm người dùng");
      }

      const result = await response.json();
      if (result.users && result.users.length > 0) {
        usersData = result.users; // Cập nhật mảng usersData với kết quả tìm kiếm
        renderPage(1); // Hiển thị trang đầu tiên của kết quả tìm kiếm
      } else {
        alert("Không tìm thấy người dùng nào.");
        usersData = []; // Xóa dữ liệu trong usersData nếu không có kết quả
        renderPage(1); // Xóa danh sách hiện tại trên giao diện
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }

  // Hàm để fetch danh sách người dùng cho trang userlist
  async function fetchUsers() {
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi lấy danh sách người dùng");
      }

      usersData = await response.json();
      totalUsers = usersData.length;

      renderPage(currentPage);
      renderPagination();
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
    }
  }

  // Hàm để render một trang cụ thể của danh sách user
  function renderPage(page) {
    const tableBody = document.querySelector(".user-list__table-body");
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalUsers);

    tableBody.innerHTML = "";

    for (let i = startIndex; i < endIndex; i++) {
      const user = usersData[i];
      const row = document.createElement("div");
      row.classList.add("user-list__table-row");

      row.innerHTML = `
            <p class="user-list__table-cell">${i + 1}</p>
            <p class="user-list__table-cell">${user.username}</p>
            <p class="user-list__table-cell">${user.email}</p>
            <div class="user-list__table-cell user-list__table-actions">
              <button class="user-list__action-button detail-button" data-user-id="${user._id
        }">↗</button>
              <button class="user-list__action-button edit-button" data-user-id="${user._id
        }">✎</button>
              <button class="user-list__action-button delete-button" data-user-id="${user._id
        }">🗑</button>
            </div>
          `;

      tableBody.appendChild(row);
    }

    // Gắn sự kiện click cho nút "↗"
    document.querySelectorAll(".detail-button").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id");
        viewDetailUser(userId);
      });
    });

    // Gắn sự kiện click cho nút "✎"
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id");
        updateUser(userId);
      });
    });

    // Gắn sự kiện click cho nút "🗑"
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id");
        deleteUser(userId);
      });
    });
  }

  // Hàm để chuyển hướng đến trang updateuser.html
  function updateUser(userId) {
    localStorage.setItem("userId", userId);
    window.location.href = "/updateuser.html";
  }

  // Hàm để render phân trang
  function renderPagination() {
    const paginationContainer = document.querySelector(
      ".user-list__pagination"
    );
    const totalPages = Math.ceil(totalUsers / rowsPerPage);

    paginationContainer.innerHTML = "";

    // Tạo nút "Trước"
    const prevButton = document.createElement("button");
    prevButton.textContent = "«";
    prevButton.classList.add("user-list__pagination-button");
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        renderPagination();
      }
    });
    paginationContainer.appendChild(prevButton);

    // Tạo nút cho mỗi trang
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.classList.add("user-list__pagination-button");
      if (i === currentPage) {
        pageButton.classList.add("active");
      }
      pageButton.addEventListener("click", () => {
        currentPage = i;
        renderPage(currentPage);
        renderPagination();
      });
      paginationContainer.appendChild(pageButton);
    }

    // Tạo nút "Sau"
    const nextButton = document.createElement("button");
    nextButton.textContent = "»";
    nextButton.classList.add("user-list__pagination-button");
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        renderPagination();
      }
    });
    paginationContainer.appendChild(nextButton);

    // Thêm phần chọn số dòng mỗi trang
    const select = document.createElement("select");
    select.classList.add("user-list__pagination-select");
    [6, 10, 20].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      if (value === rowsPerPage) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      rowsPerPage = parseInt(this.value, 10);
      currentPage = 1;
      renderPage(currentPage);
      renderPagination();
    });

    paginationContainer.appendChild(select);

    // Thêm chữ "/Page" sau phần chọn số dòng
    const pageLabel = document.createElement("span");
    pageLabel.classList.add("user-list__pagination-page");
    pageLabel.textContent = "/Page";
    paginationContainer.appendChild(pageLabel);
  }

  // Hàm để chuyển hướng đến trang detailuser.html
  function viewDetailUser(userId) {
    localStorage.setItem("userId", userId);
    window.location.href = "/detailuser.html";
  }

  // Hàm để xóa người dùng bằng API
  async function deleteUser(userId) {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        const response = await fetch(`${apiUrl}/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("Xóa người dùng thành công!");
          fetchUsers(); // Cập nhật lại danh sách sau khi xóa thành công
        } else {
          const errorData = await response.json();
          alert(
            `Xóa người dùng thất bại: ${errorData.message || "Lỗi không xác định"
            }`
          );
        }
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Xóa người dùng thất bại do lỗi kết nối");
      }
    }
  }

  // Hàm đăng xuất
  function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");

    // Chuyển hướng về trang đăng nhập
    window.location.href = "/signin.html";
    console.log("true");
  }

  // Gắn sự kiện click vào phần tử đăng xuất
  const logoutIcons = document.querySelectorAll(
    ".user-info-logout-icon, .user-form__user-icon img"
  );
  logoutIcons.forEach((icon) => {
    icon.addEventListener("click", logout);
  });

  // Hàm để thêm sự kiện cho nút "New User"
  function setupNewUserButton() {
    const newUserButton = document.querySelector(".user-list__new-user");
    if (newUserButton) {
      newUserButton.addEventListener("click", function () {
        window.location.href = "/adduser.html";
      });
    }
  }
});
async function searchUsers(query) {
  const searchUrl = `${apiUrl}/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Thêm token nếu cần thiết
        Authorization: "Bearer YOUR_AUTH_TOKEN",
      },
    });

    if (!response.ok) {
      throw new Error("Lỗi khi tìm kiếm người dùng");
    }

    const result = await response.json();
    if (result.users && result.users.length > 0) {
      usersData = result.users; // Cập nhật mảng usersData với kết quả tìm kiếm
      renderPage(1); // Hiển thị trang đầu tiên của kết quả tìm kiếm
    } else {
      alert("Không tìm thấy người dùng nào.");
      usersData = []; // Xóa dữ liệu trong usersData nếu không có kết quả
      renderPage(1); // Xóa danh sách hiện tại trên giao diện
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://crudnodejs-production.up.railway.app/api/users";
  let userId = localStorage.getItem("userId");

  // Hàm tạo mật khẩu ngẫu nhiên
  function generateRandomPassword() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let randomPassword = "";
    for (let i = 0; i < 8; i++) {
      randomPassword += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return randomPassword;
  }

  // Mở popup đổi mật khẩu và tạo mật khẩu ngẫu nhiên
  window.openChangePasswordPopup = function () {
    document.getElementById("changePasswordPopup").style.display = "block";
    const newPassword = generateRandomPassword();
    document.getElementById("popup-password").value = newPassword;
  };

  // Đóng popup
  window.closePopup = function () {
    document.getElementById("changePasswordPopup").style.display = "none";
  };

  // Hàm gửi yêu cầu thay đổi mật khẩu qua API
  window.changePassword = async function () {
    const email = document.getElementById("popup-email").value;
    const newPassword = document.getElementById("popup-password").value;

    if (!email || !newPassword) {
      alert("Vui lòng điền đầy đủ thông tin email và mật khẩu mới.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Mật khẩu đã được đặt lại thành công!");
        document.getElementById("password").value = newPassword; // Cập nhật mật khẩu trong trường chính
        closePopup();
      } else {
        alert("Cập nhật mật khẩu thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật mật khẩu:", error);
      alert("Cập nhật mật khẩu thất bại do lỗi kết nối");
    }
  };

  // Hàm lấy chi tiết người dùng
  async function fetchUserDetails() {
    if (!userId) return;

    try {
      const response = await fetch(`${apiUrl}/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Lỗi khi lấy thông tin người dùng");

      const user = await response.json();
      document.getElementById("username").value = user.username;
      document.getElementById("email").value = user.email;
      document.getElementById("popup-email").value = user.email;
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
    }
  }

  // Gọi hàm lấy chi tiết người dùng khi tải trang
  fetchUserDetails();

  // Xử lý khi nhấn nút "Save" trên form thay đổi mật khẩu
  document
    .querySelector(".user-form-button-save")
    .addEventListener("click", async function () {
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!username || !email || !password) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
          alert("Cập nhật người dùng thành công!");
          window.location.href = "/userlist.html";
        } else {
          alert("Cập nhật người dùng thất bại.");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        alert("Cập nhật người dùng thất bại do lỗi kết nối");
      }
    });

  // Xử lý khi nhấn nút "Cancel"
  document
    .querySelector(".user-form-button-cancel")
    .addEventListener("click", function () {
      window.location.href = "/userlist.html";
    });
});

// Hàm đăng xuất
function logout() {
  // Xóa dữ liệu xác thực khỏi LocalStorage (nếu có)
  localStorage.removeItem("userId"); // Xóa ID người dùng khỏi localStorage
  localStorage.removeItem("authToken"); // Xóa token xác thực (nếu có)

  // Chuyển hướng về trang đăng nhập
  window.location.href = "/signin.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Các mã hiện có của bạn...

  // Gắn sự kiện click vào phần tử đăng xuất
  const logoutIcons = document.querySelectorAll(
    ".user-info-logout-icon, .user-form__user-icon img"
  );
  logoutIcons.forEach((icon) => {
    icon.addEventListener("click", logout);
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // Tìm phần tử "Projects" trong sidebar
  const projectNavItem = document.querySelector(
    ".user-list__nav-item-wrapper:nth-child(2) .user-list__nav-item"
  );

  // Kiểm tra nếu phần tử "Projects" tồn tại, thêm sự kiện click để chuyển hướng
  if (projectNavItem) {
    projectNavItem.addEventListener("click", function () {
      window.location.href = "/projectlist.html";
    });
  }
});
