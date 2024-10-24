document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");

  if (!signupForm) {
    console.error("Không tìm thấy form đăng ký trong DOM.");
    return;
  }

  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const requestBody = {
      username: name,
      email: email,
      password: password,
    };

    // URL của API
    const url =
      "https://crudnodejs-production.up.railway.app/api/users/register";

    try {
      // Gửi yêu cầu POST đến API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Kiểm tra phản hồi từ server
      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (response.status === 201) {
        // Giả sử phản hồi có dạng { id: '123', username: 'testuser', email: 'test@example.com' }
        const userId = result.id; // Lấy ID từ phản hồi

        // Lưu ID vào Local Storage
        localStorage.setItem("userId", userId);
        alert("Đăng ký thành công! ID của bạn đã được lưu.");

        // Chuyển hướng đến trang đăng nhập hoặc trang khác
        window.location.href = "/signin.html"; // Đổi URL này thành trang đích bạn muốn
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      alert("Không thể kết nối với server!");
    }
  });
});
