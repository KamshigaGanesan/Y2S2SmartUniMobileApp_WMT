# V8 External Restaurant Menu Cards Architecture

You are completely right! Making students type out "Zinger Burger" and guess the price manually for famous restaurants like KFC is very messy and tedious. The Custom Form should only be for random local shops. 

We need **Menu Cards** for KFC and Pizza Hut just like the normal Main Canteen!

## 1. The Realization
Currently, clicking *any* External Restaurant chip (KFC, Pizza Hut) shows the generic "External Order Builder" text inputs. This is what makes it messy.

## 2. The Implementation Plan
I will structure the app to fix this completely:

### A. Dedicated Restaurant Menus (Mock Data Hub)
I will build an internal menu catalog specifically for the External Restaurants so they act like real apps:
- **KFC Menu Dataset**: Mock items like `Zinger Burger`, `Hot & Crispy Chicken`, `Krushers`.
- **Pizza Hut Menu Dataset**: Mock items like `Cheese Pizza`, `Spicy Chicken Pizza`, `Garlic Bread`.

### B. Smart State Routing
When you click the "KFC" chip:
- The UI will **NOT** show the text form. 
- Instead, it will map out a gorgeous grid of **KFC-specific Menu Cards**, complete with images and real prices (e.g., LKR 1200).
- Users can just click the `[+]` button to add KFC items to their cart exactly like they do for the Main canteen!

### C. The "Custom Order" Text Box
I will restrict the massive "Text Forms" you saw in the screenshot to ONLY appear if a student clicks the **"Jaffna Special / Custom Request"** chip. This way, if they want food from a random small shop, they can use the text form, but big names like KFC get proper beautiful UI grids.

## User Review Required
> [!IMPORTANT]
> Since we do not have an admin portal setup for KFC and Pizza Hut yet, I will hardcode a premium selection of 4-5 mock menu items for KFC, Pizza Hut, and Juice Bar so they look beautiful and instantly functional. Once approved, I can execute this instantly! Do you approve?
