
import { Users, Calendar, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const SidebarContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      title: "Scheduler",
      icon: Calendar,
      path: "/",
      onClick: () => navigate("/"),
    },
    {
      title: "Participants",
      icon: Users,
      path: "/participants",
      onClick: () => navigate("/participants"),
    },
  ];

  return (
    <>
      <div className="flex items-center h-16 px-4 mb-4 bg-[#f9fafb] shadow-sm rounded-lg">
        <img 
          src="/lovable-uploads/0ff7ce02-62e2-4665-b101-44281d8d042c.png"
          alt="PickleHub Logo"
          className="h-8 w-8 mr-2 rounded-full object-cover"
        />
        <span className="text-xl font-bold">PickleHub</span>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <SidebarContent className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={item.onClick}
                      className={cn(
                        "w-full rounded-lg transition-colors",
                        location.pathname === item.path
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "hover:bg-gray-100"
                      )}
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
      </div>
    </>
  );
};

export function AppSidebar() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <button className="fixed top-4 left-4 p-2 bg-white rounded-lg shadow-sm">
            <Menu className="h-6 w-6" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4">
            <SidebarContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sidebar className="w-64 p-2 bg-[#f9fafb]">
      <SidebarContent />
    </Sidebar>
  );
}
