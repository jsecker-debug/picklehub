
import { Users, Calendar, Menu, X, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
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
import { useEffect } from "react";

const AppSidebarContent = ({ isMobile }: { isMobile?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadFont = async () => {
      const font = new FontFace(
        'Catfiles',
        'url(https://fontesk.com/download/catfiles-font/)'
      );

      try {
        await font.load();
        document.fonts.add(font);
        console.log('Catfiles font loaded successfully');
      } catch (error) {
        console.error('Error loading Catfiles font:', error);
      }
    };

    loadFont();
  }, []);

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
    {
      title: "Sessions",
      icon: Clock,
      path: "/sessions",
      onClick: () => navigate("/sessions"),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between h-16 px-2 mb-2 bg-[#f9fafb] shadow-[0_2px_4px_0px_rgba(0,0,0,0.1)] rounded-lg">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/0ff7ce02-62e2-4665-b101-44281d8d042c.png"
            alt="PickleHub Logo"
            className="h-8 w-8 mr-2 rounded-full object-cover"
          />
          <span className="text-xl font-bold font-catfiles">PickleHub</span>
        </div>
        {isMobile && (
          <DrawerClose className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <X className="h-5 w-5" />
          </DrawerClose>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <SidebarContent className="px-1 py-1">
          <SidebarGroup>
            <SidebarGroupContent className="space-y-0.5">
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
      <Drawer direction="top">
        <DrawerTrigger asChild>
          <button className="fixed top-4 left-4 p-2 bg-white rounded-lg shadow-sm">
            <Menu className="h-6 w-6" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <div className="relative bg-white rounded-lg">
            <AppSidebarContent isMobile={true} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sidebar className="w-64 p-2 bg-[#f9fafb]">
      <AppSidebarContent isMobile={false} />
    </Sidebar>
  );
}
