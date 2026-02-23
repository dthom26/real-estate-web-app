// Layout component placeholder
export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
