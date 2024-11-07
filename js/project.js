document.addEventListener("DOMContentLoaded", function () {
  $(".project-form").on("submit", async function (event) {
    event.preventDefault();

    const projectName = $("#project-name").val();
    const projectDescription = $("#project-description").val();
    const startDate = $("#start-date").val();
    const endDate = $("#end-date").val();

    const projectData = {
      name: projectName,
      description: projectDescription,
      startDate: startDate,
      endDate: endDate,
    };

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("Bạn cần đăng nhập để tạo dự án.");
        return;
      }

      const createProjectResponse = await fetch(
        "https://crudnodejs-production.up.railway.app/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(projectData),
        }
      );

      if (!createProjectResponse.ok) {
        const errorResponse = await createProjectResponse.json();
        console.error("Lỗi khi tạo dự án:", errorResponse);
        alert(
          `Lỗi khi tạo dự án: ${createProjectResponse.status} - ${
            errorResponse.message || "Chi tiết lỗi không xác định"
          }`
        );
        return;
      }

      const projectResult = await createProjectResponse.json();
      const projectId = projectResult.id;
      console.log("ID của dự án vừa được tạo:", projectId);

      localStorage.setItem("projectId", projectId);

      alert(
        `Dự án "${projectResult.name}" đã được tạo thành công với ID: ${projectId}.`
      );

      $("#project-name").val("");
      $("#project-description").val("");
      $("#start-date").val("");
      $("#end-date").val("");

      window.location.href = "/projectlist.html";
    } catch (error) {
      console.error("Lỗi khi tạo dự án:", error);
      alert("Có lỗi xảy ra khi tạo dự án. Vui lòng thử lại sau.");
    }
  });

  // Xử lý sự kiện khi nhấn vào nút Cancel
  $(".project-form__button--cancel").on("click", function () {
    $("#project-name").val("");
    $("#project-description").val("");
    $("#start-date").val("");
    $("#end-date").val("");
  });

  // Chuyển hướng đến trang đăng nhập khi nhấn vào icon logout
  $(".user-info__logout-icon, .project-list-logout-icon ").on(
    "click",
    function logout() {
      localStorage.removeItem("userId");
      localStorage.removeItem("authToken");

      window.location.href = "/signin.html";
    }
  );

  // Chuyển hướng đến trang thêm dự án khi nhấn vào nút "New Project"
  $(".project-list-new-project-button").on("click", function () {
    window.location.href = "/addproject.html";
  });

  // Chuyển hướng đến trang danh sách người dùng khi nhấn vào "Users"
  $(".project-list-nav-item-wrapper").on("click", function () {
    const label = $(this).find(".project-list-nav-item").text().trim();
    if (label === "Users") {
      window.location.href = "/userlist.html";
    }
  });
  $(document).on("click", ".view-detail", function () {
    const projectId = $(this).data("project-id"); // Lấy projectId từ nút được nhấn
    if (projectId) {
      window.location.href = `/detailproject.html?id=${projectId}`;
    } else {
      console.error("Không tìm thấy ID của dự án.");
      alert("Không thể chuyển đến trang chi tiết vì thiếu ID của dự án.");
    }
  });
  $(document).on("click", ".edit-project", function () {
    const projectId = $(this).data("project-id"); // Lấy projectId từ nút được nhấn
    if (projectId) {
      window.location.href = `/updateproject.html?id=${projectId}`;
    } else {
      console.error("Không tìm thấy ID của dự án.");
      alert("Không thể chuyển đến trang cập nhật vì thiếu ID của dự án.");
    }
  });

  let currentPage = 1;
  let itemsPerPage = 10;

  async function fetchProjects() {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("Bạn cần đăng nhập để xem các dự án.");
        window.location.href = "/signin.html";
        return;
      }

      const response = await fetch(
        "https://crudnodejs-production.up.railway.app/api/projects",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Xử lý sự kiện submit của form tạo dự án

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Lỗi khi lấy danh sách dự án:", errorResponse);
        alert(
          `Lỗi khi lấy danh sách dự án: ${response.status} - ${
            errorResponse.message || "Lỗi không xác định"
          }`
        );
        return;
      }

      const projects = await response.json();
      displayProjects(projects);
      setupPagination(projects.length);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dự án:", error);
      alert("Có lỗi xảy ra khi lấy danh sách dự án. Vui lòng thử lại sau.");
    }
  }

  function displayProjects(projects) {
    const tableBody = $(".project-list-table-body");
    tableBody.empty();

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentProjects = projects.slice(start, end);

    currentProjects.forEach((project, index) => {
      const startDate = project.startDate.split("T")[0];
      const endDate = project.endDate.split("T")[0];
      const statusIndicator = `<span class="project-list-status-indicator project-list-status-indicator-new"></span>`;
      const row = `
      <div class="project-list-table-row">
        <div class="project-list-table-cell">${start + index + 1}</div>
        <div class="project-list-table-cell">${project.name}</div>
        <div class="project-list-table-cell project-list-status">${statusIndicator} New</div>
        <div class="project-list-table-cell">${startDate}</div>
        <div class="project-list-table-cell">${endDate}</div>
        <div class="project-list-table-cell project-list-actions">
          <button class="project-list-action-button view-detail" data-project-id="${
            project._id
          }">↗</button>
          <button class="project-list-action-button edit-project" data-project-id="${
            project._id
          }">✎</button> <!-- Biểu tượng chỉnh sửa -->
          <button class="project-list-action-button delete-project" data-project-id="${
            project._id
          }">🗑</button>
        </div>
      </div>`;
      tableBody.append(row);
    });
  }

  function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = $(".project-list-pagination");
    paginationContainer.empty();

    const prevButton = $(
      '<button class="project-list-pagination-button">&laquo;</button>'
    );
    prevButton.on("click", function () {
      if (currentPage > 1) {
        currentPage--;
        fetchProjects();
      }
    });
    paginationContainer.append(prevButton);

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = $(
        `<button class="project-list-pagination-button">${i}</button>`
      );
      if (i === currentPage) pageButton.addClass("active");
      pageButton.on("click", function () {
        currentPage = i;
        fetchProjects();
      });
      paginationContainer.append(pageButton);
    }

    const nextButton = $(
      '<button class="project-list-pagination-button">&raquo;</button>'
    );
    nextButton.on("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        fetchProjects();
      }
    });
    paginationContainer.append(nextButton);

    const itemsPerPageSelect = $(
      '<select class="project-list-pagination-select"></select>'
    );
    [10, 20, 50].forEach((value) => {
      const option = $(`<option value="${value}">${value}</option>`);
      if (value === itemsPerPage) option.prop("selected", true);
      itemsPerPageSelect.append(option);
    });
    itemsPerPageSelect.on("change", function () {
      itemsPerPage = parseInt($(this).val());
      currentPage = 1;
      fetchProjects();
    });
    paginationContainer.append(itemsPerPageSelect);
    paginationContainer.append(
      '<span class="project-list-pagination-page">/Page</span>'
    );
  }

  $(".project-list-table-body").on(
    "click",
    ".delete-project",
    async function () {
      const projectId = $(this).data("project-id");

      if (!projectId) {
        alert("Không tìm thấy ID dự án. Vui lòng kiểm tra lại.");
        return;
      }

      const isConfirmed = confirm("Bạn có chắc chắn muốn xóa dự án này không?");
      if (!isConfirmed) return;

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `https://crudnodejs-production.up.railway.app/api/projects/${projectId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          alert("Dự án đã được xóa thành công.");
          $(this).closest("tr").remove();
          fetchProjects();
        } else {
          const errorResponse = await response.json();
          alert(
            `Lỗi khi xóa dự án: ${errorResponse.message || "Không xác định"}`
          );
        }
      } catch (error) {
        console.error("Lỗi khi xóa dự án:", error);
        alert("Có lỗi xảy ra khi xóa dự án. Vui lòng thử lại sau.");
      }
    }
  );

  fetchProjects();
});
