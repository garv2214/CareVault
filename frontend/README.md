# Care-Vault Frontend - Static HTML Demos

## 🚀 Quick Start

### View Demos
- Open `index.html` in browser for landing page with all demos
- Direct links:
  - Authentication: `authentication_1/code.html`, `authentication_2/code.html`
  - Doctor Dashboards: `doctor_dashboard_1/code.html`, `doctor_dashboard_2/code.html`
  - Patient Dashboards: `patient_dashboard_1/code.html`, `patient_dashboard_2/code.html`
  - Emergency: `emergency_access_modal_1/code.html`, `emergency_access_modal_2/code.html`

### Serve Locally
```bash
npx serve .
```

### Deploy
- Vercel: `vercel --prod`
- Netlify: Drag `frontend/` folder

## 📁 Structure
```
frontend/
├── index.html              # Demo landing page
├── authentication_*/
├── doctor_dashboard_*/
├── patient_dashboard_*/
├── emergency_access_modal_*/
├── ethercare_minimal_*/    # Design docs
└── landing_page/           # Assets
```

## 🔮 Next Steps
1. Integrate ethers.js & wallet connect (add CDNs/scripts to HTML)
2. Connect to backend API & blockchain contracts
3. Convert to React SPA using these designs as templates
4. Add dark mode toggle, responsive enhancements

## Credits
- UI Prototypes from stitch_care_vault_web_frontend
- Tailwind CSS, Material Symbols
