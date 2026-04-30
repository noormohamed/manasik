# Hotel Policies - Visual Guide

## Hotel Manager Interface

### Edit Hotel Modal - Policies Section

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Hotel: Edward's Medina Retreat                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [Tabs: Basic Info | Location | Check-in/out | Policies]   │
│                                                              │
│ ═══════════════════════════════════════════════════════════ │
│ POLICIES                                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                              │
│ Standard Policies                                            │
│ ───────────────────────────────────────────────────────────  │
│                                                              │
│ ☑ 👤 Age Restriction                                        │
│   Minimum age requirement for check-in                      │
│   Minimum Age: [18]                                         │
│                                                              │
│ ☑ 🐻 Pets                                                   │
│   Pet policy and any applicable charges                     │
│   [Pets are allowed on request. Charges may apply.]        │
│                                                              │
│ ☑ 👥 Groups                                                 │
│   Policy for group bookings                                 │
│   [When booking more than 9 rooms, different policies...]  │
│                                                              │
│ ☐ 🚭 Smoking                                                │
│   Smoking policy in rooms and common areas                  │
│                                                              │
│ ☑ 🔇 Quiet Hours                                            │
│   Quiet hours policy for guests                             │
│   [Quiet hours from 10 PM to 8 AM...]                      │
│                                                              │
│ ☐ 🎉 Parties & Events                                       │
│   Policy on parties and events in rooms                     │
│                                                              │
│ ───────────────────────────────────────────────────────────  │
│ Custom Policies                                              │
│ ───────────────────────────────────────────────────────────  │
│                                                              │
│ ☑ Early Check-in Available                                  │
│   Available for $25 per hour                                │
│   [Delete]                                                  │
│                                                              │
│ ☑ Free WiFi                                                 │
│   High-speed WiFi throughout the hotel                      │
│   [Delete]                                                  │
│                                                              │
│ [+ Add Policy]                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ [Cancel]                          [Save Changes]            │
└─────────────────────────────────────────────────────────────┘
```

## Guest View - Hotel Page

### Policies Section on Hotel Details Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│ HOTEL POLICIES                                               │
│                                                              │
│ ┌──────────────────┐  ┌──────────────────┐                 │
│ │ 👤 Age           │  │ 🐻 Pets          │                 │
│ │ Restriction      │  │                  │                 │
│ │                  │  │ Pets are allowed │                 │
│ │ The minimum age  │  │ on request.      │                 │
│ │ for check-in is  │  │ Charges may be   │                 │
│ │ 18               │  │ applicable.      │                 │
│ └──────────────────┘  └──────────────────┘                 │
│                                                              │
│ ┌──────────────────┐  ┌──────────────────┐                 │
│ │ 👥 Groups        │  │ 🔇 Quiet Hours   │                 │
│ │                  │  │                  │                 │
│ │ When booking     │  │ Quiet hours from │                 │
│ │ more than 9      │  │ 10 PM to 8 AM.   │                 │
│ │ rooms, different │  │ Please keep      │                 │
│ │ policies apply.  │  │ noise low.       │                 │
│ └──────────────────┘  └──────────────────┘                 │
│                                                              │
│ Additional Policies                                          │
│ ───────────────────────────────────────────────────────────  │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Early Check-in Available                                │ │
│ │ Available for $25 per hour                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Free WiFi                                               │ │
│ │ High-speed WiFi throughout the hotel                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Add Custom Policy Flow

```
Step 1: Click "Add Policy"
┌─────────────────────────────────────────┐
│ [+ Add Policy]                          │
└─────────────────────────────────────────┘
                    ↓
Step 2: Form appears
┌─────────────────────────────────────────┐
│ Policy Title *                          │
│ [Early Check-in Available]              │
│                                         │
│ Description                             │
│ [Available for $25 per hour]            │
│                                         │
│ [Add] [Cancel]                          │
└─────────────────────────────────────────┘
                    ↓
Step 3: Policy added to list
┌─────────────────────────────────────────┐
│ ☑ Early Check-in Available              │
│   Available for $25 per hour            │
│   [Delete]                              │
└─────────────────────────────────────────┘
```

## Standard Policy Input Examples

### Age Restriction
```
☑ 👤 Age Restriction
  Minimum age requirement for check-in
  
  Minimum Age: [18]
```

### Pets
```
☑ 🐻 Pets
  Pet policy and any applicable charges
  
  ┌─────────────────────────────────────┐
  │ Pets are allowed on request.        │
  │ Charges may be applicable.          │
  │ Maximum 2 pets per room.            │
  └─────────────────────────────────────┘
```

### Groups
```
☑ 👥 Groups
  Policy for group bookings
  
  ┌─────────────────────────────────────┐
  │ When booking more than 9 rooms,     │
  │ different policies and additional   │
  │ supplements may apply.              │
  └─────────────────────────────────────┘
```

### Smoking
```
☑ 🚭 Smoking
  Smoking policy in rooms and common areas
  
  ┌─────────────────────────────────────┐
  │ Smoking is not allowed in rooms.    │
  │ Smoking area available in lobby.    │
  └─────────────────────────────────────┘
```

### Quiet Hours
```
☑ 🔇 Quiet Hours
  Quiet hours policy for guests
  
  ┌─────────────────────────────────────┐
  │ Quiet hours from 10 PM to 8 AM.     │
  │ Please keep noise levels low.       │
  └─────────────────────────────────────┘
```

### Parties & Events
```
☑ 🎉 Parties & Events
  Policy on parties and events in rooms
  
  ┌─────────────────────────────────────┐
  │ Parties and events are not allowed  │
  │ in rooms.                           │
  └─────────────────────────────────────┘
```

## Mobile View

### Hotel Manager - Mobile
```
┌──────────────────────────────┐
│ Edit Hotel              [X]  │
├──────────────────────────────┤
│                              │
│ POLICIES                     │
│                              │
│ ☑ 👤 Age Restriction        │
│   Minimum Age: [18]          │
│                              │
│ ☑ 🐻 Pets                    │
│   [Pets are allowed...]      │
│                              │
│ ☑ 👥 Groups                  │
│   [When booking more...]     │
│                              │
│ [+ Add Policy]               │
│                              │
├──────────────────────────────┤
│ [Cancel] [Save Changes]      │
└──────────────────────────────┘
```

### Guest View - Mobile
```
┌──────────────────────────────┐
│ HOTEL POLICIES               │
│                              │
│ ┌────────────────────────┐   │
│ │ 👤 Age Restriction     │   │
│ │ The minimum age for    │   │
│ │ check-in is 18         │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ 🐻 Pets                │   │
│ │ Pets are allowed on    │   │
│ │ request. Charges may   │   │
│ │ be applicable.         │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ 👥 Groups              │   │
│ │ When booking more than │   │
│ │ 9 rooms, different     │   │
│ │ policies apply.        │   │
│ └────────────────────────┘   │
│                              │
│ Additional Policies          │
│                              │
│ ┌────────────────────────┐   │
│ │ Early Check-in         │   │
│ │ Available for $25/hr   │   │
│ └────────────────────────┘   │
│                              │
└──────────────────────────────┘
```

## Icon Reference

| Policy | Icon | Remixicon Class |
|--------|------|-----------------|
| Age Restriction | 👤 | ri-user-forbid-line |
| Pets | 🐻 | ri-bear-smile-line |
| Groups | 👥 | ri-group-line |
| Smoking | 🚭 | ri-forbid-2-line |
| Quiet Hours | 🔇 | ri-volume-mute-line |
| Parties & Events | 🎉 | ri-emotion-happy-line |

## Color Scheme

- **Primary**: Blue (#0066cc) - Buttons, active states
- **Success**: Green (#28a745) - Save success
- **Danger**: Red (#dc3545) - Delete buttons
- **Muted**: Gray (#6c757d) - Descriptions, disabled text
- **Background**: Light gray (#f8f9fa) - Form backgrounds
- **Border**: Light gray (#dee2e6) - Card borders

## Responsive Breakpoints

- **Mobile**: < 576px - Single column
- **Tablet**: 576px - 768px - 2 columns
- **Desktop**: > 768px - 2-3 columns

## Accessibility Features

- ✅ Proper form labels
- ✅ Checkbox accessibility
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast text
- ✅ Focus indicators
