
import { Users, Calendar } from "lucide-react";
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
    <Sidebar className="w-64">
      <div className="flex items-center h-16 px-4 mb-6 bg-white shadow-sm rounded-lg mx-2 mt-2">
        <img 
          src="/lovable-uploads/0ff7ce02-62e2-4665-b101-44281d8d042c.png"
          alt="PickleHub Logo"
          className="h-8 w-8 mr-2 rounded-full object-cover"
        />
        <span className="text-xl font-bold">PickleHub</span>
      </div>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    className="w-full rounded-lg hover:bg-gray-100 transition-colors"
                  >
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
