export const categories = [
  { id: "tech", name: "Công nghệ" },
  { id: "business", name: "Kinh doanh" },
  { id: "lifestyle", name: "Đời sống" },
  { id: "science", name: "Khoa học" },
];

export const authors = [
  {
    id: "author-1",
    name: "Nguyễn Văn A",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
    cover: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000",
    bio: "Chuyên gia công nghệ với 10 năm kinh nghiệm trong lĩnh vực AI và Machine Learning.",
    followers: 1250,
    following: 45,
    joined: "Tháng 3, 2020",
    role: "Chuyên gia AI",
  },
  {
    id: "author-2",
    name: "Trần Thị B",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    cover: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000",
    bio: "Phân tích viên tài chính, nhà báo chuyên viết về thị trường bất động sản và đầu tư.",
    followers: 890,
    following: 120,
    joined: "Tháng 6, 2021",
    role: "Biên tập viên Kinh tế",
  },
  {
    id: "author-3",
    name: "Lê Văn C",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000",
    bio: "Blogger phong cách sống, tác giả của nhiều đầu sách best-seller về phát triển bản thân.",
    followers: 3400,
    following: 15,
    joined: "Tháng 1, 2019",
    role: "Tác giả Best-seller",
  },
  {
    id: "author-4",
    name: "Phạm T",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    bio: "Nhà nghiên cứu khoa học vũ trụ, thường xuyên cập nhật tin tức từ NASA và các tổ chức thiên văn quốc tế.",
    followers: 5600,
    following: 50,
    joined: "Tháng 11, 2022",
    role: "Nhà nghiên cứu",
  },
  {
    id: "author-5",
    name: "Đặng K",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
    bio: "Nhà sáng lập startup, cố vấn kinh doanh cho các doanh nghiệp vừa và nhỏ tại Việt Nam.",
    followers: 2100,
    following: 300,
    joined: "Tháng 8, 2020",
    role: "Startup Mentor",
  }
];

export const articles = [
  {
    id: "1",
    title: "Tương lai của Trí tuệ Nhân tạo trong vòng 5 năm tới",
    excerpt: "AI đang phát triển với tốc độ chóng mặt, thay đổi cách chúng ta làm việc và sinh sống...",
    content: `
      <p>Trí tuệ nhân tạo (AI) không còn là khái niệm của tương lai xa xôi, nó đang hiện diện và thay đổi từng khía cạnh của cuộc sống hàng ngày. Trong vòng 5 năm tới, các chuyên gia dự đoán một sự bùng nổ thực sự trong việc ứng dụng AI vào y tế, giáo dục và giao thông.</p>
      <br/>
      <p>Tuy nhiên, cùng với sự phát triển này là những thách thức không nhỏ về đạo đức và bảo mật dữ liệu. Các nhà lập pháp đang nỗ lực chạy đua với công nghệ để đảm bảo an toàn cho người dùng.</p>
    `,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    author: "Nguyễn Văn A",
    authorId: "author-1",
    date: "20/10/2023",
    isVip: true,
    category: "tech",
    views: 12500
  },
  {
    id: "2",
    title: "Thị trường Bất động sản có dấu hiệu phục hồi",
    excerpt: "Nhiều tín hiệu tích cực từ chính sách vĩ mô đang giúp thị trường BĐS ấm dần lên...",
    content: "Nội dung bài viết về bất động sản...",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    author: "Trần Thị B",
    authorId: "author-2",
    date: "19/10/2023",
    isVip: false,
    category: "business",
    views: 8400
  },
  {
    id: "3",
    title: "Cách duy trì thói quen đọc sách mỗi ngày",
    excerpt: "Chỉ với 15 phút mỗi ngày, bạn có thể thay đổi hoàn toàn tư duy của mình...",
    content: "Nội dung bài viết về thói quen đọc sách...",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    author: "Lê Văn C",
    authorId: "author-3",
    date: "18/10/2023",
    isVip: false,
    category: "lifestyle",
    views: 4200
  },
  {
    id: "4",
    title: "Khám phá hành tinh mới có khả năng sự sống",
    excerpt: "NASA vừa công bố phát hiện một hành tinh có kích thước tương đương Trái Đất...",
    content: "Nội dung bài viết về khoa học vũ trụ...",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=800",
    author: "Phạm T",
    authorId: "author-4",
    date: "17/10/2023",
    isVip: true,
    category: "science",
    views: 15600
  },
  {
    id: "5",
    title: "Khởi nghiệp công nghệ: Những điều cần biết",
    excerpt: "Hành trình khởi nghiệp chưa bao giờ là dễ dàng, đặc biệt trong lĩnh vực công nghệ...",
    content: "Nội dung bài viết...",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    author: "Đặng K",
    authorId: "author-5",
    date: "16/10/2023",
    isVip: false,
    category: "business",
    views: 3100
  }
];

export const comments = [
  { id: 1, user: "Hoàng M", avatar: "https://i.pravatar.cc/150?u=1", content: "Bài viết rất hữu ích, cảm ơn tác giả!", time: "2 giờ trước" },
  { id: 2, user: "Thùy L", avatar: "https://i.pravatar.cc/150?u=2", content: "Mình rất mong đợi phần tiếp theo.", time: "5 giờ trước" },
];

export const vipPackages = [
  { id: "1mo", name: "Gói 1 Tháng", price: "99.000đ", duration: "30 ngày", features: ["Đọc không giới hạn bài viết VIP", "Không quảng cáo", "Tải PDF lưu trữ"] },
  { id: "1yr", name: "Gói 1 Năm", price: "899.000đ", duration: "365 ngày", features: ["Tất cả quyền lợi của gói 1 tháng", "Tiết kiệm 25%", "Tham gia cộng đồng kín", "Huy hiệu thành viên VIP"] }
];

export const dashboardStats = {
  totalPosts: 1254,
  totalViews: "2.4M",
  revenue: "154.000.000đ",
  chartData: [
    { name: 'T2', views: 4000, revenue: 2400 },
    { name: 'T3', views: 3000, revenue: 1398 },
    { name: 'T4', views: 2000, revenue: 9800 },
    { name: 'T5', views: 2780, revenue: 3908 },
    { name: 'T6', views: 1890, revenue: 4800 },
    { name: 'T7', views: 2390, revenue: 3800 },
    { name: 'CN', views: 3490, revenue: 4300 },
  ]
};
