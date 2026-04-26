import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type Lang = "en" | "ar";

const dict = {
  en: {
    appName: "مكتب الطلبة الجامعيين الميزابيين بقسنطينة",
    tagline: "Discover and order great books",
    enter: "Enter",
    loggingIn: "Logging in...",
    username: "Username",
    enterUsernameToStart: "Enter your username to start selling",
    welcome: "Welcome",
    readyForFair: "Ready for the book fair.",
    loginFailed: "Login failed",
    loginErrorDesc: "Could not log in. Try again.",
    logout: "Logout",
    hello: "Hello",
    staffLogin: "Staff Login",
    backToShop: "Back to shop",

    // Landing
    ourBooks: "Book Fair",
    browseAndOrder: "Browse our collection and place an order in seconds",
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    addToCart: "Add to cart",
    sellNow: "Sell",
    yourOrder: "Your Order",
    quantity: "Quantity",
    remove: "Remove",
    total: "Total",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    placeOrder: "Place Order",
    placingOrder: "Placing order...",
    orderPlaced: "Order placed!",
    orderPlacedDesc: "We will contact you soon to confirm.",
    orderFailed: "Could not place order",
    nameRequired: "Please enter your name",
    phoneRequired: "Please enter your phone number",
    cartCleared: "Cart cleared",
    continueShopping: "Continue shopping",
    soldOut: "Sold Out",
    onlyLeft: "Only {n} left",
    inCart: "In cart",

    // POS
    searchBooks: "Search books...",
    noBooksFound: "No books found",
    mySales: "My Sales",
    mySalesHistory: "My Sales History",
    loading: "Loading...",
    noSalesYet: "No sales yet. Start scanning!",
    qty: "Qty",
    to: "To",
    each: "each",
    stock: "Stock",
    buyerNameOptional: "Buyer Name (Optional)",
    buyerPlaceholder: "e.g. Grade 4 Class",
    completeSale: "Complete Sale",
    processing: "Processing...",
    saleSuccessful: "Sale Successful!",
    soldX: "Sold {qty}x {name}",

    // Admin
    dashboard: "Dashboard",
    overviewTitle: "Overview of book fair performance",
    totalRevenue: "Total Revenue",
    unitsSold: "Units Sold",
    totalSales: "Total Sales",
    lowStockAlerts: "Low Stock Alerts",
    topBooks: "Top Books",
    viewAll: "View All",
    noSalesYet2: "No sales yet.",
    presenterLeaderboard: "Presenter Leaderboard",
    manageUsers: "Manage Users",
    noPresentersWithSales: "No presenters with sales yet.",
    unitsSoldShort: "units sold",
    sales: "sales",
    units: "units",

    booksInventory: "Books Inventory",
    manageTitlesPricing: "Manage titles, pricing, and stock",
    addBook: "Add Book",
    editBook: "Edit Book",
    addNewBook: "Add New Book",
    title: "Title",
    bookTitlePlaceholder: "Book Title",
    descriptionOptional: "Description (Optional)",
    shortDescription: "Short description",
    coverUrlOptional: "Cover Image URL (Optional)",
    costPrice: "Cost Price",
    sellingPrice: "Selling Price",
    stockLabel: "Stock",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    createBook: "Create Book",
    cover: "Cover",
    cost: "Cost",
    price: "Price",
    actions: "Actions",
    bookCreated: "Book created",
    bookUpdated: "Book updated",
    bookDeleted: "Book deleted",
    confirmDeleteBook: 'Are you sure you want to delete "{name}"?',

    presentersStaff: "Presenters & Staff",
    managePosAccess: "Manage POS access",
    addUser: "Add User",
    addNewUser: "Add New User",
    user: "User",
    role: "Role",
    you: "You",
    admin: "Admin",
    presenter: "Presenter",
    usersLogInWithUsername: "Users log in using this username only.",
    administrator: "Administrator",
    grantAdminAccess: "Grant access to dashboard and inventory.",
    createUser: "Create User",
    userCreated: "User created",
    userRemoved: "User removed",
    cannotDeleteSelf: "Cannot delete yourself",
    confirmRemoveUser: 'Are you sure you want to remove user "{name}"?',
    error: "Error",
    failedToCreateUser: "Failed to create user",

    allSales: "All Sales",
    realtimeHistory: "Real-time transaction history",
    date: "Date",
    book: "Book",
    buyer: "Buyer",
    noSalesRecorded: "No sales recorded yet.",

    // Orders
    customerOrders: "Customer Orders",
    customerOrdersDesc: "Online orders from the public landing page",
    customer: "Customer",
    phone: "Phone",
    status: "Status",
    statusPending: "Pending",
    statusConfirmed: "Confirmed",
    statusDone: "Done",
    statusCancelled: "Cancelled",
    noOrdersYet: "No orders yet.",
    orderUpdated: "Order updated",
    orderDeleted: "Order deleted",
    confirmDeleteOrder: "Are you sure you want to delete this order?",
    orders: "Orders",

    // Not found
    pageNotFound: "Page Not Found",
    didYouForget: "Did you forget to add the page to the router?",
  },
  ar: {
    appName: "مكتب الطلبة الجامعيين الميزابيين بقسنطينة",
    tagline: "اكتشف واطلب كتبًا رائعة",
    enter: "دخول",
    loggingIn: "جاري الدخول...",
    username: "اسم المستخدم",
    enterUsernameToStart: "أدخل اسم المستخدم للبدء بالبيع",
    welcome: "مرحبًا",
    readyForFair: "جاهز لمعرض الكتاب.",
    loginFailed: "فشل تسجيل الدخول",
    loginErrorDesc: "تعذر تسجيل الدخول. حاول مرة أخرى.",
    logout: "تسجيل الخروج",
    hello: "مرحبًا",
    staffLogin: "دخول الموظفين",
    backToShop: "العودة إلى المتجر",

    ourBooks: "معرض الكتاب",
    browseAndOrder: "تصفح مجموعتنا وأرسل طلبك في ثوانٍ",
    cart: "السلة",
    cartEmpty: "سلتك فارغة",
    addToCart: "أضف إلى السلة",
    sellNow: "اشتر",
    yourOrder: "طلبك",
    quantity: "الكمية",
    remove: "حذف",
    total: "المجموع",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    placeOrder: "تأكيد الطلب",
    placingOrder: "جاري إرسال الطلب...",
    orderPlaced: "تم إرسال الطلب!",
    orderPlacedDesc: "سنتواصل معك قريبًا للتأكيد.",
    orderFailed: "تعذر إرسال الطلب",
    nameRequired: "يرجى إدخال اسمك",
    phoneRequired: "يرجى إدخال رقم هاتفك",
    cartCleared: "تم إفراغ السلة",
    continueShopping: "متابعة التسوق",
    soldOut: "نفد المخزون",
    onlyLeft: "متبقي {n} فقط",
    inCart: "في السلة",

    searchBooks: "ابحث عن كتاب...",
    noBooksFound: "لا توجد كتب",
    mySales: "مبيعاتي",
    mySalesHistory: "سجل مبيعاتي",
    loading: "جاري التحميل...",
    noSalesYet: "لا توجد مبيعات بعد. ابدأ البيع!",
    qty: "الكمية",
    to: "إلى",
    each: "للوحدة",
    stock: "المخزون",
    buyerNameOptional: "اسم المشتري (اختياري)",
    buyerPlaceholder: "مثال: قسم الرابعة",
    completeSale: "إتمام البيع",
    processing: "جاري المعالجة...",
    saleSuccessful: "تم البيع بنجاح!",
    soldX: "تم بيع {qty} × {name}",

    dashboard: "لوحة التحكم",
    overviewTitle: "نظرة عامة على أداء معرض الكتاب",
    totalRevenue: "إجمالي الإيرادات",
    unitsSold: "الوحدات المباعة",
    totalSales: "إجمالي المبيعات",
    lowStockAlerts: "تنبيهات المخزون المنخفض",
    topBooks: "أفضل الكتب",
    viewAll: "عرض الكل",
    noSalesYet2: "لا توجد مبيعات بعد.",
    presenterLeaderboard: "ترتيب البائعين",
    manageUsers: "إدارة المستخدمين",
    noPresentersWithSales: "لا يوجد بائعون لهم مبيعات بعد.",
    unitsSoldShort: "وحدة مباعة",
    sales: "بيع",
    units: "وحدة",

    booksInventory: "مخزون الكتب",
    manageTitlesPricing: "إدارة العناوين والأسعار والمخزون",
    addBook: "إضافة كتاب",
    editBook: "تعديل الكتاب",
    addNewBook: "إضافة كتاب جديد",
    title: "العنوان",
    bookTitlePlaceholder: "عنوان الكتاب",
    descriptionOptional: "الوصف (اختياري)",
    shortDescription: "وصف مختصر",
    coverUrlOptional: "رابط صورة الغلاف (اختياري)",
    costPrice: "سعر التكلفة",
    sellingPrice: "سعر البيع",
    stockLabel: "المخزون",
    cancel: "إلغاء",
    saveChanges: "حفظ التغييرات",
    createBook: "إنشاء الكتاب",
    cover: "الغلاف",
    cost: "التكلفة",
    price: "السعر",
    actions: "إجراءات",
    bookCreated: "تم إنشاء الكتاب",
    bookUpdated: "تم تحديث الكتاب",
    bookDeleted: "تم حذف الكتاب",
    confirmDeleteBook: 'هل أنت متأكد من حذف "{name}"؟',

    presentersStaff: "البائعون والموظفون",
    managePosAccess: "إدارة صلاحيات نقطة البيع",
    addUser: "إضافة مستخدم",
    addNewUser: "إضافة مستخدم جديد",
    user: "المستخدم",
    role: "الدور",
    you: "أنت",
    admin: "مسؤول",
    presenter: "بائع",
    usersLogInWithUsername: "يستخدم المستخدمون اسم المستخدم هذا فقط لتسجيل الدخول.",
    administrator: "مسؤول",
    grantAdminAccess: "منح الوصول إلى لوحة التحكم والمخزون.",
    createUser: "إنشاء المستخدم",
    userCreated: "تم إنشاء المستخدم",
    userRemoved: "تمت إزالة المستخدم",
    cannotDeleteSelf: "لا يمكنك حذف نفسك",
    confirmRemoveUser: 'هل أنت متأكد من إزالة المستخدم "{name}"؟',
    error: "خطأ",
    failedToCreateUser: "فشل إنشاء المستخدم",

    allSales: "جميع المبيعات",
    realtimeHistory: "سجل المعاملات اللحظي",
    date: "التاريخ",
    book: "الكتاب",
    buyer: "المشتري",
    noSalesRecorded: "لم يتم تسجيل أي مبيعات بعد.",
    confirmDeleteSale: "هل أنت متأكد من حذف هذه البيعة؟ سيؤدي ذلك إلى استعادة مخزون الكتاب.",
    saleDeleted: "تم حذف البيعة واستعادة المخزون",

    todayRevenue: "إيرادات اليوم",
    todayUnits: "وحدات اليوم",
    importCSV: "استيراد CSV",
    csvImportSuccess: "تم استيراد {count} كتب بنجاح",
    csvImportError: "فشل استيراد CSV",
    donation: "تبرع",
    donationOptional: "تبرع (اختياري)",

    customerOrders: "طلبات العملاء",
    customerOrdersDesc: "الطلبات الواردة من صفحة المتجر العامة",
    customer: "العميل",
    phone: "الهاتف",
    status: "الحالة",
    statusPending: "قيد الانتظار",
    statusConfirmed: "مؤكد",
    statusDone: "منجز",
    statusCancelled: "ملغى",
    noOrdersYet: "لا توجد طلبات بعد.",
    orderUpdated: "تم تحديث الطلب",
    orderDeleted: "تم حذف الطلب",
    confirmDeleteOrder: "هل أنت متأكد من حذف هذا الطلب؟",
    orders: "الطلبات",

    pageNotFound: "الصفحة غير موجودة",
    didYouForget: "هل نسيت إضافة الصفحة إلى الموجّه؟",
  },
} as const;

type Key = keyof typeof dict.en;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "bookFairLang";

function applyToDocument(lang: Lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return saved === "ar" || saved === "en" ? saved : "en";
  });

  useEffect(() => {
    applyToDocument(lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "ar" : "en");
  }, [lang, setLang]);

  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>) => {
      let s: string = (dict[lang] as Record<string, string>)[key] ?? (dict.en as Record<string, string>)[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
