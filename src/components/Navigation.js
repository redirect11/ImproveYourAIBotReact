
import React from "react";
import { Sidebar } from "flowbite-react";
import { HiArrowSmRight, HiPencil, HiUser, HiChat, HiChip } from "react-icons/hi";

const customTheme = {

    root: {
      base: "h-full",
      collapsed: {
        on: "w-16",
        off: "w-48"
      },
      inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 px-1 py-2 dark:bg-gray-800"
    },
    collapse: {
      button: "group flex w-full items-center rounded-lg p-1 text-sm font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
      icon: {
        base: "h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
        open: {
          off: "",
          on: "text-gray-900"
        }
      },
      label: {
        base: "ml-3 flex-1 whitespace-nowrap text-left",
        icon: {
          base: "h-6 w-6 transition delay-0 ease-in-out",
          open: {
            on: "rotate-180",
            off: ""
          }
        }
      },
      list: "space-y-2 py-2"
    },
    cta: {
      base: "mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700",
      color: {
        blue: "bg-cyan-50 dark:bg-cyan-900",
        dark: "bg-dark-50 dark:bg-dark-900",
        failure: "bg-red-50 dark:bg-red-900",
        gray: "bg-alternative-50 dark:bg-alternative-900",
        green: "bg-green-50 dark:bg-green-900",
        light: "bg-light-50 dark:bg-light-900",
        red: "bg-red-50 dark:bg-red-900",
        purple: "bg-purple-50 dark:bg-purple-900",
        success: "bg-green-50 dark:bg-green-900",
        yellow: "bg-yellow-50 dark:bg-yellow-900",
        warning: "bg-yellow-50 dark:bg-yellow-900"
      }
    },
    item: {
      base: "flex items-center justify-center rounded-lg p-1 text-sm font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
      active: "bg-gray-100 dark:bg-gray-700",
      collapsed: {
        insideCollapse: "group w-full pl-8 transition duration-75",
        noIcon: "font-bold"
      },
      content: {
        base: "flex-1 whitespace-nowrap px-3"
      },
      icon: {
        base: "h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
        active: "text-gray-700 dark:text-gray-100"
      },
      label: "",
      listItem: ""
    },
    items: {
      base: ""
    },
    itemGroup: {
      base: "mt-2 space-y-2 border-t border-gray-200 pt-2 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700"
    },
    logo: {
      base: "mb-5 flex items-center pl-2.5",
      collapsed: {
        on: "hidden",
        off: "self-center whitespace-nowrap text-xl font-semibold dark:text-white"
      },
      img: "mr-3 h-6 sm:h-7"
    }
  };


const Navigation = () => {
  return (
    <aside
    className="absolute left-0 top-0 z-9999 flex flex-none h-screen w-48 flex-col overflow-y-hidden bg-zinc-800 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 translate-x-0"
  >
    <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      {/* <!-- Sidebar Menu --> */}
        <Sidebar theme={customTheme} aria-label="ImporoveYourAiBot Navigation" className="mt-3 py-2 px-2 lg:mt-2 lg:px-3">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item href="#/chatbot-settings" icon={HiChip}>
                Chatobt Settings
              </Sidebar.Item>
              <Sidebar.Item href="#/assistants-settings" icon={HiUser}>
                Assistenti
              </Sidebar.Item>
              <Sidebar.Item href="#/chat" icon={HiChat}>
                Chat
              </Sidebar.Item>
              <Sidebar.Collapse icon={HiPencil} label="Trascrizioni">
                <Sidebar.Item href="#/transcriptions-settings">Modifica Trascrizioni</Sidebar.Item>
                <Sidebar.Item href="#/transcriptions-settings/import">Importa Trascrizioni</Sidebar.Item>
             </Sidebar.Collapse>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      {/* <!-- Sidebar Menu --> */}
    </div>
  </aside>
  );
}

export default Navigation;