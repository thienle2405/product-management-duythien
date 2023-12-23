module.exports = (query) => {
  let filterOrder = [
      {
          name: "Tất cả",
          status: "",
          class: ""
      },
      {
          name: "Đang Chờ Xử Lý",
          status: "pending",
          class: ""
      },
      {
          name: "Đã Xác Nhận",
          status: "confirmed",
          class: ""
      },
      {
        name: "Đang Giao Hàng",
        status: "shipping",
        class: ""
      },
      {
        name: "Giao Hàng Thành Công",
        status: "delivered",
        class: ""
      },
      {
        name: "Đã Hủy",
        status: "cancelled",
        class: ""
      },
      {
        name: "Trả Hàng",
        status: "refunded",
        class: ""
      }
  ];

  if (query.status) {
      const index = filterOrder.findIndex(item => item.status === query.status);
      filterOrder[index].class = "active";
  } else {
      const index = filterOrder.findIndex(item => item.status === "");
      filterOrder[index].class = "active";
  }
  return filterOrder;
}