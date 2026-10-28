
const stats = [
  { label: "فروش امروز", value: "۰ تومان", detail: "مجموع فروش ثبت‌شده", icon: "↗" },
  { label: "فاکتورهای امروز", value: "۰", detail: "فاکتور صادرشده", icon: "▤" },
  { label: "مدل‌های کالا", value: "۰", detail: "مدل ثبت‌شده در انبار", icon: "♧" },
  { label: "موجودی کم", value: "۰", detail: "کالا نیازمند بررسی", icon: "!" },
];

const shortcuts = [
  { icon: "+", title: "ثبت فروش جدید", description: "ثبت اقلام و صدور فاکتور", href: "#sales" },
  { icon: "♧", title: "افزودن کالا", description: "ثبت مدل، پارچه، رنگ و سایز", href: "/products" },
  { icon: "▤", title: "مشاهده فاکتورها", description: "بررسی فروش‌های ثبت‌شده", href: "#invoices" },
  { icon: "↗", title: "گزارش فروش", description: "بررسی آمار و عملکرد فروشگاه", href: "#reports" },
];

const menu = [
  { icon: "⌂", title: "داشبورد", href: "#dashboard" },
  { icon: "＋", title: "ثبت فروش", href: "#sales" },
  { icon: "♧", title: "کالاها و انبار", href: "/products"},
  { icon: "▤", title: "فاکتورها", href: "#invoices" },
  { icon: "♙", title: "مشتریان", href: "#customers" },
  { icon: "↗", title: "گزارش‌های مالی", href: "#reports" },
];

export default function Home() {
  return (
    <main className="app-shell" dir="rtl" id="dashboard">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark">س</span>
          <span>
            <strong>SORMEH</strong>
            <small>مدیریت فروشگاه پوشاک</small>
          </span>
        </a>

        <div className="menu-caption">مدیریت فروشگاه</div>
        <nav className="side-menu" aria-label="منوی اصلی">
          {menu.map((item, index) => (
            <a
              className={`menu-item ${index === 0 ? "active" : ""}`}
              href={item.href}
              key={item.title}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.title}</span>
              {index === 0 && <span className="active-dot" />}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="store-status">
            <span className="status-dot" />
            <div>
              <strong>نسخه محلی فروشگاه</strong>
              <small>آماده راه‌اندازی</small>
            </div>
          </div>
          <p>سورمه · مدیریت هوشمند فروش</p>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <div className="breadcrumb">فروشگاه / داشبورد</div>
            <h1>داشبورد مدیریت</h1>
          </div>
          <div className="topbar-left">
            <span className="local-badge">
              <span className="status-dot" />
              نسخه آزمایشی
            </span>
            <div className="avatar">س</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span className="eyebrow">SORMEH STORE</span>
              <h2>به سورمه خوش آمدید</h2>
              <p>
                فروش، کالاها و موجودی فروشگاهت را از یکجا مدیریت کن.
              </p>
            </div>
            <div className="welcome-decoration" aria-hidden="true">
              <span className="decoration-circle circle-one" />
              <span className="decoration-circle circle-two" />
              <span className="decoration-letter">س</span>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <h2>خلاصه عملکرد</h2>
                <p>نمای کلی وضعیت فروشگاه</p>
              </div>
              <span className="date-label">آمار پس از اتصال دیتابیس نمایش داده می‌شود</span>
            </div>

            <div className="stats-grid">
              {stats.map((stat, index) => (
                <article className="stat-card" key={stat.label}>
                  <div className={`stat-icon stat-icon-${index}`}>
                    {stat.icon}
                  </div>
                  <p>{stat.label}</p>
                  <strong className="stat-value">{stat.value}</strong>
                  <span className="stat-detail">{stat.detail}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <h2>دسترسی سریع</h2>
                <p>ابزارهای پرکاربرد فروشگاه</p>
              </div>
            </div>

            <div className="shortcuts-grid">
              {shortcuts.map((item) => (
                <a className="shortcut-card" href={item.href} key={item.title}>
                  <span className="shortcut-icon">{item.icon}</span>
                  <span className="shortcut-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="shortcut-arrow">←</span>
                </a>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <h2>آخرین فروش‌ها</h2>
                <p>فاکتورهای ثبت‌شده در فروشگاه</p>
              </div>
              <a className="text-link" href="#invoices">همه فاکتورها ←</a>
            </div>

            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <strong>هنوز فروشی ثبت نشده است</strong>
              <p>
                پس از راه‌اندازی بخش فروش، فاکتورهای شما در این قسمت نمایش داده می‌شوند.
              </p>
            </div>
          </section>

          <footer className="app-footer">
            <span>SORMEH · نرم‌افزار مدیریت فروشگاه پوشاک</span>
            <span>نسخه اولیه · اطلاعات واقعی هنوز متصل نشده‌اند</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
