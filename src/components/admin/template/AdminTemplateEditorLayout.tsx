
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const AdminTemplateEditorLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <Breadcrumb className="mb-6">
      <BreadcrumbItem>
        <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/admin/templates">Templates</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Edit or Create Template</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
    {children}
  </div>
);

export default AdminTemplateEditorLayout;
