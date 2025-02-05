
import { Users, Calendar, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();

  const items = [
    {
      title: "Scheduler",
      icon: Calendar,
      onClick: () => navigate("/"),
    },
    {
      title: "Participants",
      icon: Users,
      onClick: () => navigate("/participants"),
    },
  ];

  return (
    <Sidebar className="w-64 border-r">
      <div className="flex items-center h-16 px-4 border-b">
        <span className="text-xl font-bold">PickleHub</span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
