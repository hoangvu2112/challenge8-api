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

    const url =
      "https://crudnodejs-production.up.railway.app/api/users/register";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (response.status === 201) {
        // Lưu toàn bộ thông tin tài khoản vào Local Storage
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: result.id,
            username: result.username,
            email: result.email,
          })
        );
        alert("Đăng ký thành công! Thông tin tài khoản đã được lưu.");

        // Chuyển hướng đến trang đăng nhập hoặc trang khác
        window.location.href = "/signin.html";
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      alert("Không thể kết nối với server!");
    }
  });
});
