// utils/menuFilter.js
export const filterMenuItems = (menuItems, userRoles) => {
    return menuItems
      .filter((item) => {
        // Show item if no roles are specified or if user has the required role
        if (!item.roles) return true;
        return userRoles.includes(item.roles);
      })
      .map((item) => {
        // Filter subItems if they exist
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((subItem) => {
            if (!subItem.roles) return true;
            return userRoles.includes(subItem.roles);
          });
          // Only include parent item if it has accessible subItems or no role restriction
          if (filteredSubItems.length > 0 || !item.roles) {
            return { ...item, subItems: filteredSubItems };
          }
          return null; // Exclude parent if no subItems are accessible and it’s restricted
        }
        return item;
      })
      .filter(Boolean); // Remove null items
  };