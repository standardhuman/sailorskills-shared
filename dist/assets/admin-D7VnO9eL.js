import"./modulepreload-polyfill-B5Qt9EMX.js";function me(){return window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"http://localhost:3001/api":"/api"}const ie=me();class fe{constructor(){this.selectedCustomer=null,this.customers=[],this.currentServiceKey=null,this.modalSelectedCustomerId=null,this.selectedAnodes={},this.anodeDetails=null,this.init()}init(){console.log("Initializing Admin App"),this.setupEventListeners()}setupEventListeners(){const e=document.getElementById("customerSearch");e&&e.addEventListener("keypress",n=>{n.key==="Enter"&&this.searchCustomers()});const t=document.getElementById("modalCustomerSearch");t&&t.addEventListener("input",n=>{this.filterModalCustomers(n.target.value)})}scrollToServiceForm(){let e=document.getElementById("wizardContainer");if((!e||e.style.display==="none")&&(e=document.querySelector(".service-form-container")),(!e||e.style.display==="none")&&(e=document.querySelector(".charge-summary")),e&&e.style.display!=="none"){const t=document.getElementById("simpleServiceButtons")||document.querySelector(".simple-service-buttons");if(t){const i=t.getBoundingClientRect().bottom+window.pageYOffset+20;window.scrollTo({top:i,behavior:"smooth"})}else{const i=e.getBoundingClientRect().top+window.pageYOffset-60;window.scrollTo({top:Math.max(0,i),behavior:"smooth"})}}}populateAdminServiceButtons(){const e=document.getElementById("simpleServiceButtons");if(!e){console.error("Service buttons container not found");return}e.innerHTML="",[{key:"recurring_cleaning",label:"🔄 Recurring Cleaning",gradient:"linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)"},{key:"onetime_cleaning",label:"🧽 One-Time Cleaning",gradient:"linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)"},{key:"item_recovery",label:"🔍 Item Recovery",gradient:"linear-gradient(135deg, #AD1457 0%, #C2185B 100%)"},{key:"underwater_inspection",label:"🤿 Underwater Inspection",gradient:"linear-gradient(135deg, #00695C 0%, #00897B 100%)"},{key:"propeller_service",label:"⚙️ Propeller Service",gradient:"linear-gradient(135deg, #E65100 0%, #F57C00 100%)"},{key:"anodes_only",label:"⚡ Anodes Only",gradient:"linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)"}].forEach(({key:n,label:o,gradient:i})=>{if(!window.serviceData[n])return;const a=document.createElement("button");a.className="simple-service-btn",a.textContent=o,a.style.cssText=`
                padding: 12px 20px;
                background: ${i};
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                transition: all 0.3s;
                text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                font-weight: 600;
            `,a.onclick=()=>this.selectAdminService(n),e.appendChild(a)})}selectService(e){return this.selectAdminService(e)}selectAdminService(e){if(console.log("Selecting service:",e),this.currentServiceKey=e,window.currentServiceKey=e,window.selectedServiceKey=e,!window.serviceData){console.log("serviceData not loaded yet, retrying in 100ms..."),setTimeout(()=>this.selectAdminService(e),100);return}const t=window.serviceData[e];if(!t){console.error("Service not found:",e);return}if(setTimeout(()=>{const n=document.getElementById("wizardContainer");if(n&&n.style.display!=="none"){const r=(n.querySelector("input, select, textarea")||n).getBoundingClientRect().top+window.pageYOffset-60-10;window.scrollTo({top:Math.max(0,r),behavior:"smooth"})}},200),window.renderConsolidatedForm&&(e==="recurring_cleaning"||e==="onetime_cleaning"||e==="anodes_only")){console.log("Service will be handled by renderConsolidatedForm");const n=e==="recurring_cleaning"||e==="onetime_cleaning";window.renderConsolidatedForm(n,e);return}if(e==="anodes_only"){document.getElementById("simpleServiceButtons").style.display="none";const n=document.getElementById("wizardContainer");n.style.display="block",this.openAnodeWizardForAnodesOnly()}else if(t.type==="per_foot"){document.getElementById("simpleServiceButtons").style.display="none";const n=document.getElementById("wizardContainer");n.style.display="block";const o=document.getElementById("wizardContent");(!o||!o.innerHTML.trim())&&this.initializeWizard(e)}else{const n=t.rate||0,o=document.getElementById("totalCostDisplay");o&&(o.textContent=`$${n.toFixed(2)}`)}setTimeout(()=>this.updateChargeSummary(),100)}initializeWizard(e){const t=document.getElementById("wizardContent");if(t){if(e==="propeller_service"){t.innerHTML=`
                <div class="admin-wizard">
                    <h3>${window.serviceData[e].name}</h3>
                    <div class="wizard-field">
                        <label>Number of Propellers</label>
                        <input type="number" id="propellerCount" min="1" max="4" value="1"
                               oninput="adminApp.updatePropellerService()">
                        <div style="margin-top: 10px; color: #666; font-size: 14px;">
                            Service rate: $349 per propeller
                        </div>
                    </div>
                    <div class="wizard-field">
                        <label>
                            <input type="checkbox" id="propellerRemoval" checked
                                   onchange="adminApp.updatePropellerService()">
                            <span>Removal Service</span>
                        </label>
                    </div>
                    <div class="wizard-field">
                        <label>
                            <input type="checkbox" id="propellerInstall"
                                   onchange="adminApp.updatePropellerService()">
                            <span>Installation Service</span>
                        </label>
                    </div>
                    <div class="wizard-actions">
                        <button class="btn-secondary" onclick="adminApp.backToServices()">← Back</button>
                    </div>
                </div>
            `,this.updatePropellerService();return}t.innerHTML=`
            <div class="admin-wizard">
                <h3>${window.serviceData[e].name}</h3>

                <div class="wizard-field">
                    <label>Boat Length (feet)</label>
                    <input type="number" id="adminBoatLength" min="10" max="200" value="30"
                           oninput="adminApp.updateFromWizard()">
                </div>

                <div class="wizard-field">
                    <label>Hull Type</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="adminHullType" value="monohull" checked
                                   onchange="adminApp.updateFromWizard()">
                            <span>Monohull</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="adminHullType" value="catamaran"
                                   onchange="adminApp.updateFromWizard()">
                            <span>Catamaran (+25% surcharge)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="adminHullType" value="trimaran"
                                   onchange="adminApp.updateFromWizard()">
                            <span>Trimaran (+50% surcharge)</span>
                        </label>
                    </div>
                </div>

                ${e.includes("cleaning")?`
                <div class="wizard-field">
                    <label>Paint Condition</label>
                    <div class="button-group">
                        <button class="condition-btn active" data-value="excellent"
                                onclick="adminApp.setPaintCondition('excellent')">Excellent</button>
                        <button class="condition-btn" data-value="good"
                                onclick="adminApp.setPaintCondition('good')">Good</button>
                        <button class="condition-btn" data-value="fair"
                                onclick="adminApp.setPaintCondition('fair')">Fair</button>
                        <button class="condition-btn" data-value="poor"
                                onclick="adminApp.setPaintCondition('poor')">Poor</button>
                    </div>
                </div>

                <div class="wizard-field">
                    <label>Growth Level: <span id="growthLabel">Minimal</span> - <span id="growthPercent">0%</span> surcharge</label>
                    <input type="range" id="adminGrowthLevel" min="0" max="100" value="0"
                           oninput="adminApp.updateGrowthDisplay(this.value); adminApp.updateFromWizard()">
                    <div class="slider-labels">
                        <span class="slider-label" style="left: 5%">Minimal<br><small>0%</small></span>
                        <span class="slider-label" style="left: 30%">Moderate<br><small>25%</small></span>
                        <span class="slider-label" style="left: 55%">Heavy<br><small>50%</small></span>
                        <span class="slider-label" style="left: 85%">Severe<br><small>200%</small></span>
                    </div>
                </div>
                `:""}

                <div class="wizard-field">
                    <label>
                        <input type="checkbox" id="adminPowerboat" onchange="adminApp.updateFromWizard()">
                        <span>Powerboat (not sailing vessel) (+25% surcharge)</span>
                    </label>
                </div>

                <div class="wizard-field">
                    <label>
                        <input type="checkbox" id="adminTwinEngines" onchange="adminApp.updateFromWizard()">
                        <span>Twin engines (+10% surcharge)</span>
                    </label>
                </div>


                <div class="wizard-actions">
                    <button onclick="adminApp.closeWizard()" class="btn-secondary">← Back to Services</button>
                </div>
            </div>
        `,document.getElementById("boatLength").value="30",document.getElementById("actualPaintCondition")&&(document.getElementById("actualPaintCondition").value="excellent"),document.getElementById("actualGrowthLevel")&&(document.getElementById("actualGrowthLevel").value="0"),document.getElementById("additionalHulls").value="0",setTimeout(()=>{this.calculateAdminPrice(),this.updateChargeSummary()},100)}}setPaintCondition(e){document.querySelectorAll(".condition-btn").forEach(t=>{t.classList.remove("active")}),event.target.classList.add("active"),document.getElementById("actualPaintCondition").value=e,this.updateFromWizard()}updateGrowthDisplay(e){const t=parseInt(e);let n=0,o="Minimal";t<=20?(n=0,o="Minimal"):t<=35?(n=Math.round((t-20)*25/15),o="Moderate"):t<=60?(n=25+Math.round((t-35)*25/25),o="Heavy"):(n=50+Math.round((t-60)*150/40),o="Severe"),document.getElementById("growthPercent").textContent=n+"%";const i=document.getElementById("growthLabel");i&&(i.textContent=o);let a=document.getElementById("actualGrowthLevel");a||(a=document.createElement("input"),a.type="hidden",a.id="actualGrowthLevel",document.body.appendChild(a)),a.value=e}updatePropellerService(){var s,r,d;const e=parseInt((s=document.getElementById("propellerCount"))==null?void 0:s.value)||1,t=(r=document.getElementById("propellerRemoval"))==null?void 0:r.checked,n=(d=document.getElementById("propellerInstall"))==null?void 0:d.checked;let o=0;t&&(o+=e),n&&(o+=e);const i=o*349,a=document.getElementById("totalCostDisplay");a&&(a.textContent=`$${i.toFixed(2)}`),this.propellerDetails={count:e,removal:t,install:n,totalServices:o,price:i},this.updateChargeSummary()}backToServices(){const e=document.getElementById("wizardContainer");e&&(e.style.display="none");const t=document.getElementById("simpleServiceButtons");t&&(t.style.display="flex");const n=document.querySelector(".service-selector h2");n&&(n.style.display="block"),this.currentServiceKey=null,this.propellerDetails=null,this.updateChargeSummary()}updateFromWizard(){this.updateTimeout&&clearTimeout(this.updateTimeout),this.updateTimeout=setTimeout(()=>{this._performWizardUpdate()},100)}_performWizardUpdate(){var s,r,d;const e=((s=document.getElementById("adminBoatLength"))==null?void 0:s.value)||30;document.getElementById("boatLength").value=e;const t=((r=document.querySelector('input[name="adminHullType"]:checked'))==null?void 0:r.value)||"monohull";let n=0;t==="catamaran"&&(n=1),t==="trimaran"&&(n=2);const o=document.getElementById("additionalHulls");o&&(o.value=n);const i=(d=document.getElementById("adminTwinEngines"))==null?void 0:d.checked,a=document.getElementById("has_twin_engines");a&&(a.checked=i),this.calculateAdminPrice(),this.updateChargeSummary()}calculateAdminPrice(){var y,u,g,h,w;if(!this.currentServiceKey||!window.serviceData[this.currentServiceKey])return;const e=window.serviceData[this.currentServiceKey];if(e.type!=="per_foot")return;const t=parseFloat(document.getElementById("boatLength").value)||30,n=e.rate||0;let o=t*n,i=o;this.surchargeDetails={base:i,hull:0,paint:0,growth:0,engines:0,powerboat:0};const a=parseInt((y=document.getElementById("additionalHulls"))==null?void 0:y.value)||0;let s=1;if(a===1&&(s=1.25,this.surchargeDetails.hull=25),a===2&&(s=1.5,this.surchargeDetails.hull=50),o*=s,this.currentServiceKey.includes("cleaning")){(u=document.getElementById("actualPaintCondition"))!=null&&u.value,this.surchargeDetails.paint=0;const v=parseInt((g=document.getElementById("actualGrowthLevel"))==null?void 0:g.value)||0;let I=0,L="Minimal";v<=20?(I=0,L="Minimal"):v<=35?(I=(v-20)*25/15/100,L="Moderate"):v<=60?(I=(25+(v-35)*25/25)/100,L="Heavy"):(I=(50+(v-60)*150/40)/100,L="Severe"),this.surchargeDetails.growth=I*100,this.surchargeDetails.growthLabel=L,o*=1+I}((h=document.getElementById("adminPowerboat"))==null?void 0:h.checked)&&(o*=1.25,this.surchargeDetails.powerboat=25),((w=document.getElementById("has_twin_engines"))==null?void 0:w.checked)&&(o*=1.1,this.surchargeDetails.engines=10);const c=document.getElementById("totalCostDisplay");c&&(c.value=o.toFixed(2),c.textContent=`$${o.toFixed(2)}`);const m=document.getElementById("totalCost");m&&(m.value=o.toFixed(2))}closeWizard(){document.getElementById("simpleServiceButtons").style.display="flex",document.getElementById("wizardContainer").style.display="none",this.currentServiceKey=null,window.currentServiceKey=null,window.selectedServiceKey=null,this.updateChargeSummary()}openAnodeWizardForAnodesOnly(){document.getElementById("wizardContent").innerHTML=`
            <div class="admin-wizard">
                <h3>⚓ Select Anodes</h3>

                <div class="anode-selector">
                    <div class="wizard-field">
                        <input type="text" id="anodeSearch" class="search-input"
                               placeholder="Search by size or type..."
                               oninput="adminApp.filterAnodes(this.value)">
                    </div>

                    <div class="anode-categories">
                        <button class="category-btn active" onclick="adminApp.filterByCategory('all')">All</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('shaft')">Shaft</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('propeller')">Prop</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('hull')">Hull</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('collar')">Collar</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('engine')">Engine</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('rudder')">Rudder</button>
                    </div>

                    <div id="materialFilter" class="material-filter">
                        <button class="material-btn active" onclick="adminApp.filterByMaterial('all')">All</button>
                        <button class="material-btn" onclick="adminApp.filterByMaterial('zinc')">Zinc</button>
                        <button class="material-btn" onclick="adminApp.filterByMaterial('magnesium')">Mag</button>
                        <button class="material-btn" onclick="adminApp.filterByMaterial('aluminum')">Alum</button>
                    </div>

                    <div id="shaftSubfilter" class="shaft-subfilter" style="display: none;">
                        <button class="subfilter-btn active" onclick="adminApp.filterShaftType('all')">All</button>
                        <button class="subfilter-btn" onclick="adminApp.filterShaftType('standard')">Standard</button>
                        <button class="subfilter-btn" onclick="adminApp.filterShaftType('metric')">Metric</button>
                    </div>

                    <div id="anodeGrid" class="anode-grid" style="max-height: 400px; overflow-y: auto;">
                        <!-- Anodes will be populated here -->
                    </div>
                </div>

                <div class="selected-anodes">
                    <h4>Selected Anodes: <span id="selectedCount">0</span></h4>
                    <div id="selectedAnodesList"></div>
                    <div class="anode-total">
                        <strong>Anodes Subtotal: $<span id="anodeSubtotal">0.00</span></strong>
                        <br><small>Labor: $15 per anode</small>
                    </div>
                </div>

                <div class="wizard-actions">
                    <button onclick="adminApp.closeAnodesOnlyWizard()" class="btn-secondary">← Back to Services</button>
                    <button onclick="adminApp.confirmAnodesOnlySelection()" class="btn-primary">✓ Confirm Selection</button>
                </div>
            </div>
        `,this.loadAnodeCatalog(),setTimeout(()=>{this.scrollToAnodePicker()},100)}closeAnodesOnlyWizard(){document.getElementById("simpleServiceButtons").style.display="flex",document.getElementById("wizardContainer").style.display="none",this.currentServiceKey=null,window.currentServiceKey=null,window.selectedServiceKey=null,this.updateChargeSummary()}confirmAnodesOnlySelection(){const e=this.getSelectedAnodes(),t=150,n=e.totalPrice,o=e.count*15,i=Math.max(t,n+o);this.anodeDetails=e;const a=document.getElementById("totalCostDisplay");a&&(a.textContent=`$${i.toFixed(2)}`),document.getElementById("wizardContainer").style.display="none",document.getElementById("simpleServiceButtons").style.display="flex",this.updateChargeSummary(),alert("Anodes selected! Check the charge summary below.")}openAnodeWizard(){this.savedWizardState=document.getElementById("wizardContent").innerHTML,document.getElementById("wizardContent").innerHTML=`
            <div class="admin-wizard">
                <h3>⚓ Select Anodes to Add</h3>

                <div class="anode-selector">
                    <div class="wizard-field">
                        <input type="text" id="anodeSearch" class="search-input"
                               placeholder="Search by size or type..."
                               oninput="adminApp.filterAnodes(this.value)">
                    </div>

                    <div class="anode-categories">
                        <button class="category-btn active" onclick="adminApp.filterByCategory('all')">All</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('shaft')">Shaft</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('propeller')">Prop</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('hull')">Hull</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('collar')">Collar</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('engine')">Engine</button>
                        <button class="category-btn" onclick="adminApp.filterByCategory('rudder')">Rudder</button>
                    </div>

                    <div id="materialFilter" class="material-filter">
                        <button class="material-btn active" onclick="adminApp.filterByMaterial('all')">All</button>
                        <button class="material-btn" onclick="adminApp.filterByMaterial('zinc')">Zinc</button>
                        <button class="material-btn" onclick="adminApp.filterByMaterial('magnesium')">Mag</button>
                        <button class="material-btn" onclick="adminApp.filterByMaterial('aluminum')">Alum</button>
                    </div>

                    <div id="shaftSubfilter" class="shaft-subfilter" style="display: none;">
                        <button class="subfilter-btn active" onclick="adminApp.filterShaftType('all')">All</button>
                        <button class="subfilter-btn" onclick="adminApp.filterShaftType('standard')">Standard</button>
                        <button class="subfilter-btn" onclick="adminApp.filterShaftType('metric')">Metric</button>
                    </div>

                    <div id="anodeGrid" class="anode-grid" style="max-height: 400px; overflow-y: auto;">
                        <!-- Anodes will be populated here -->
                    </div>
                </div>

                <div class="selected-anodes">
                    <h4>Selected Anodes: <span id="selectedCount">0</span></h4>
                    <div id="selectedAnodesList"></div>
                    <div class="anode-total">
                        <strong>Anodes Subtotal: $<span id="anodeSubtotal">0.00</span></strong>
                        <br><small>Labor: $15 per anode</small>
                    </div>
                </div>

                <div class="wizard-actions">
                    <button onclick="adminApp.closeAnodeWizard()" class="btn-secondary">← Back to Service</button>
                    <button onclick="adminApp.confirmAnodeSelection()" class="btn-primary">✓ Add Selected Anodes</button>
                </div>
            </div>
        `,this.loadAnodeCatalog(),setTimeout(()=>{this.scrollToAnodePicker()},100)}scrollToAnodePicker(){const e=document.querySelector(".anode-selector");if(e){const n=e.getBoundingClientRect().top+window.pageYOffset-10;window.scrollTo({top:n,behavior:"smooth"})}}closeAnodeWizard(){this.savedWizardState&&(document.getElementById("wizardContent").innerHTML=this.savedWizardState,this.updateFromWizard())}confirmAnodeSelection(){const e=this.getSelectedAnodes();document.getElementById("anodesToInstall").value=e.count,this.anodeDetails=e,this.savedWizardState&&(document.getElementById("wizardContent").innerHTML=this.savedWizardState,this.updateFromWizard())}async loadAnodeCatalog(){var e;try{const t=(e=this.selectedCustomer)==null?void 0:e.boat_id;if(!t){console.log("No boat selected, loading full catalog"),await this.loadFullAnodeCatalog();return}const{data:n,error:o}=await window.supabase.from("boats").select("*, boat_anodes(*)").eq("id",t).single();if(o){console.warn("Could not fetch boat info, loading full catalog:",o),await this.loadFullAnodeCatalog();return}n.has_anodes===!1?(console.log("Boat confirmed to have no anodes"),this.displayNoAnodesMessage()):n.boat_anodes&&n.boat_anodes.length>0?(console.log("Boat has",n.boat_anodes.length,"assigned anodes, filtering catalog"),await this.loadFilteredAnodeCatalog(n.boat_anodes)):(console.log("Boat anode configuration unknown, loading full catalog"),await this.loadFullAnodeCatalog())}catch(t){console.error("Failed to load anode catalog:",t),document.getElementById("anodeGrid").innerHTML="<p>Failed to load anode catalog</p>"}}async loadFullAnodeCatalog(){var e;try{const{data:t,error:n}=await window.supabase.from("anodes_catalog").select(`
                    boatzincs_id,
                    sku,
                    name,
                    list_price,
                    category,
                    subcategory,
                    material,
                    image_url,
                    product_url,
                    anode_inventory (
                        id,
                        quantity_available
                    )
                `);if(n){console.error("Error loading anode catalog:",n),this.anodeCatalog=[];return}this.anodeCatalog=(t||[]).map(i=>{let a=null;return Array.isArray(i.anode_inventory)&&i.anode_inventory.length>0?a=i.anode_inventory[0]:i.anode_inventory&&typeof i.anode_inventory=="object"&&(a=i.anode_inventory),{boatzincs_id:i.boatzincs_id,sku:i.sku,name:i.name,list_price:i.list_price,category:i.category,subcategory:i.subcategory,material:i.material,image_url:i.image_url,product_url:i.product_url,inventory_id:(a==null?void 0:a.id)||null,quantity_available:(a==null?void 0:a.quantity_available)||0}}),console.log(`Loaded ${this.anodeCatalog.length} anodes from full catalog`),this.selectedAnodes||(this.selectedAnodes={}),((e=document.querySelector(".category-btn.active"))==null?void 0:e.textContent.toLowerCase())!=="none"&&this.displayAnodes(),setTimeout(()=>{this.updateAnodeSelection()},100)}catch(t){console.error("Failed to load anode catalog:",t),this.anodeCatalog=[]}}displayNoAnodesMessage(){const e=document.getElementById("anodeGrid");e&&(e.innerHTML=`
            <div style="padding: 30px; text-align: center; background: #f5f5f5; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 16px; color: #666; margin-bottom: 15px;">
                    This boat is configured as having no anodes.
                </p>
                <button onclick="adminApp.showAnodeCatalogOverride()"
                        style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Show Catalog Anyway
                </button>
            </div>
        `)}async loadFilteredAnodeCatalog(e){await this.loadFullAnodeCatalog();const t=e.filter(n=>n.is_active).map(n=>n.anode_catalog_id);t.length!==0&&(this.anodeCatalog=this.anodeCatalog.filter(n=>t.includes(n.boatzincs_id)),this.displayAnodes(),this.showFilteredIndicator(t.length))}showFilteredIndicator(e){const t=document.getElementById("anodeSection");if(!t)return;const n=t.querySelector(".anode-filter-indicator");n&&n.remove();const o=document.createElement("div");o.className="anode-filter-indicator",o.style.cssText="padding: 10px 15px; background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;",o.innerHTML=`
            <span style="color: #1e40af; font-size: 14px;">
                ℹ️ Showing ${e} anode${e!==1?"s":""} assigned to this boat
            </span>
            <button onclick="adminApp.showAllAnodes()"
                    style="padding: 6px 12px; background: white; color: #2563eb; border: 1px solid #2563eb; border-radius: 4px; cursor: pointer; font-size: 13px;">
                Show All Anodes
            </button>
        `;const i=t.firstElementChild;i?t.insertBefore(o,i):t.appendChild(o)}showAnodeCatalogOverride(){console.log("User overriding no-anodes configuration"),this.loadFullAnodeCatalog()}showAllAnodes(){console.log("User requesting to see all anodes"),this.loadFullAnodeCatalog();const e=document.querySelector(".anode-filter-indicator");e&&e.remove()}displayAnodes(e="all",t=""){if(!this.anodeCatalog)return;const n=document.querySelectorAll("#anodeGrid");let o=null;for(let a of n)if(a.offsetParent!==null){o=a;break}if(!o&&n.length>0&&(o=n[0]),!o)return;let i=this.anodeCatalog;if(i=i.filter(a=>{const s=(a.name||"").toLowerCase(),r=(a.sku||"").toLowerCase();return a.list_price!=null&&a.list_price>0&&!s.includes("polishing")&&!r.includes("polishing-strip")&&!r.includes("shaft-polishing-strip")&&!s.includes("free!!!")&&!(s.includes("strip")&&s.includes("3-foot"))}),this.currentMaterial&&this.currentMaterial!=="all"&&(i=i.filter(a=>(a.material||"").toLowerCase()===this.currentMaterial.toLowerCase())),this.currentStockFilter==="in_stock"&&(i=i.filter(a=>(a.quantity_available||0)>0)),e!=="all"&&(i=i.filter(a=>{const s=(a.category||"").toLowerCase(),r=e.toLowerCase();return e==="prop"?s==="propeller":e==="rudder"?s==="rudder":s===r})),t){const a=t.toLowerCase();i=i.filter(s=>s.name.toLowerCase().includes(a)||(s.sku||"").toLowerCase().includes(a))}o.innerHTML=i.map(a=>{var g;const s=a.boatzincs_id||a.sku,r=((g=this.selectedAnodes[s])==null?void 0:g.quantity)||0,d=typeof a.list_price=="string"?parseFloat(a.list_price.replace("$","")):a.list_price,c=this.simplifyAnodeName(a),m=(a.quantity_available||0)===0,y=m?'<span class="stock-badge out-of-stock">Out of Stock</span>':"",u=btoa(JSON.stringify({id:s,price:d,name:a.name,inventory_id:a.inventory_id||null}));return`
                <div class="anode-item compact${m?" out-of-stock-item":""}">
                    <div class="anode-name">
                        ${c}
                        ${y}
                    </div>
                    <div class="anode-price">$${d.toFixed(2)}</div>
                    <div class="anode-controls">
                        <button data-anode="${u}" data-change="-1" onclick="adminApp.handleAnodeClick(this)">−</button>
                        <span class="quantity" id="qty-${s}">${r}</span>
                        <button data-anode="${u}" data-change="1" onclick="adminApp.handleAnodeClick(this)">+</button>
                    </div>
                </div>
            `}).join("")}filterAnodes(e){var n;let t=((n=document.querySelector(".category-btn.active"))==null?void 0:n.textContent.toLowerCase())||"all";if(t==="none"){const o=document.getElementById("anodeGrid"),i=document.getElementById("materialFilter"),a=document.getElementById("stockFilter");if(e&&e.trim().length>0)t="all",o&&(o.style.display="grid"),i&&(i.style.display="flex"),a&&(a.style.display="flex");else{o&&(o.style.display="none"),i&&(i.style.display="none"),a&&(a.style.display="none");return}}this.displayAnodes(t,e)}simplifyAnodeName(e){let t=e.name||"";return t=t.replace(/Camp |Martyr |Performance Metals |Tecnoseal |Reliance /gi,""),t=t.replace(/\bX-\d+[A-Z]?\b/gi,""),t=t.replace(/\bAnode\b|\bZinc\b/gi,""),t=t.replace(/Shaft\s+(-\s+)?/gi,"Shaft "),t=t.replace(/\s+/g," ").replace(/\s+-\s+/g," ").trim(),t=t.replace(/^-\s*/,"").replace(/\s*-$/,""),t.length>0&&(t=t.charAt(0).toUpperCase()+t.slice(1)),t}filterByMaterial(e){var n;this.currentMaterial=e,document.querySelectorAll(".material-btn").forEach(o=>{o.classList.remove("active"),(o.textContent.toLowerCase().includes(e)||e==="all"&&o.textContent==="All")&&o.classList.add("active")});const t=((n=document.getElementById("anodeSearch"))==null?void 0:n.value)||"";this.displayAnodes(this.currentCategory||"all",t)}filterByStock(e){var n;this.currentStockFilter=e,document.querySelectorAll(".stock-btn").forEach(o=>{o.classList.remove("active"),(e==="all"&&o.textContent.includes("All Items")||e==="in_stock"&&o.textContent.includes("In Stock Only"))&&o.classList.add("active")});const t=((n=document.getElementById("anodeSearch"))==null?void 0:n.value)||"";this.displayAnodes(this.currentCategory||"all",t)}filterByCategory(e){var r;document.querySelectorAll(".category-btn").forEach(d=>{d.classList.remove("active"),(d.textContent.toLowerCase().includes(e.toLowerCase())||e==="all"&&d.textContent==="All"||e==="none"&&d.textContent==="None"||e==="engine"&&d.textContent.includes("Engine"))&&d.classList.add("active")});const t=document.getElementById("anodeGrid"),n=document.getElementById("materialFilter"),o=document.getElementById("stockFilter"),i=document.getElementById("anodeSearchField"),a=document.getElementById("shaftSubfilter");if(e==="none"){t&&(t.style.display="none"),n&&(n.style.display="none"),o&&(o.style.display="none"),i&&(i.style.display="block"),a&&(a.style.display="none");return}t&&(t.style.display="grid"),n&&(n.style.display="flex"),o&&(o.style.display="flex"),i&&(i.style.display="block"),a&&(e==="shaft"?(a.style.display="flex",document.querySelectorAll(".subfilter-btn").forEach(d=>{d.classList.remove("active"),d.textContent.includes("All")&&d.classList.add("active")})):a.style.display="none"),this.currentCategory=e;const s=((r=document.getElementById("anodeSearch"))==null?void 0:r.value)||"";this.displayAnodes(e,s)}filterShaftType(e){var n;document.querySelectorAll(".subfilter-btn").forEach(o=>{o.classList.remove("active"),(e==="all"&&o.textContent.includes("All")||e==="standard"&&o.textContent.includes("Standard")||e==="metric"&&o.textContent.includes("Metric"))&&o.classList.add("active")});const t=((n=document.getElementById("anodeSearch"))==null?void 0:n.value)||"";e==="all"?this.displayAnodes("shaft",t):this.displayAnodesWithShaftType(e,t)}displayAnodesWithShaftType(e,t=""){if(!this.anodeCatalog)return;const n=document.querySelectorAll("#anodeGrid");let o=null;for(let a of n)if(a.offsetParent!==null){o=a;break}if(!o&&n.length>0&&(o=n[0]),!o)return;let i=this.anodeCatalog;if(i=i.filter(a=>{const s=(a.name||"").toLowerCase(),r=(a.sku||"").toLowerCase();return a.list_price!=null&&a.list_price>0&&!s.includes("polishing")&&!r.includes("polishing-strip")&&!r.includes("shaft-polishing-strip")&&!s.includes("free!!!")&&!(s.includes("strip")&&s.includes("3-foot"))}),i=i.filter(a=>(a.category||"").toLowerCase().includes("shaft")),i=i.filter(a=>{const s=a.name||"",r=a.description||"",d=(s+" "+r).toLowerCase();return e==="standard"?d.match(/\d+\/\d+"|[\d.]+"\s|inch/i)&&!d.match(/\d+mm|metric/i):e==="metric"?d.match(/\d+mm|metric/i)&&!d.match(/\d+\/\d+"|[\d.]+"\s/):!1}),t){const a=t.toLowerCase();i=i.filter(s=>s.name.toLowerCase().includes(a)||(s.sku||"").toLowerCase().includes(a))}o.innerHTML=i.map(a=>{var g;const s=a.boatzincs_id||a.sku,r=((g=this.selectedAnodes[s])==null?void 0:g.quantity)||0,d=typeof a.list_price=="string"?parseFloat(a.list_price.replace("$","")):a.list_price,c=this.simplifyAnodeName(a),m=(a.quantity_available||0)===0,y=m?'<span class="stock-badge out-of-stock">Out of Stock</span>':"",u=btoa(JSON.stringify({id:s,price:d,name:a.name,inventory_id:a.inventory_id||null}));return`
                <div class="anode-item compact${m?" out-of-stock-item":""}">
                    <div class="anode-name">
                        ${c}
                        ${y}
                    </div>
                    <div class="anode-price">$${d.toFixed(2)}</div>
                    <div class="anode-controls">
                        <button data-anode="${u}" data-change="-1" onclick="adminApp.handleAnodeClick(this)">−</button>
                        <span class="quantity" id="qty-${s}">${r}</span>
                        <button data-anode="${u}" data-change="1" onclick="adminApp.handleAnodeClick(this)">+</button>
                    </div>
                </div>
            `}).join("")}handleAnodeClick(e){const t=JSON.parse(atob(e.dataset.anode)),n=parseInt(e.dataset.change);this.updateAnodeQuantity(t.id,n,t.price,t.name,t.inventory_id),this.anodeDetails=this.getSelectedAnodes(),this.updateChargeSummary()}updateAnodeQuantity(e,t,n,o,i=null){var s;this.selectedAnodes||(this.selectedAnodes={}),this.selectedAnodes[e]||(this.selectedAnodes[e]={quantity:0,price:n,name:o,inventory_id:i}),this.selectedAnodes[e].quantity=Math.max(0,this.selectedAnodes[e].quantity+t),this.selectedAnodes[e].quantity===0&&delete this.selectedAnodes[e];const a=document.getElementById(`qty-${e}`);a&&(a.textContent=((s=this.selectedAnodes[e])==null?void 0:s.quantity)||0),setTimeout(()=>{this.updateAnodeSelection()},0)}clearSelectedAnodes(){this.selectedAnodes={},document.querySelectorAll(".quantity").forEach(t=>{t.textContent="0"}),this.updateAnodeSelection();const e=document.getElementById("anodeConditionsSection");e&&(e.style.display="none"),console.log("Cleared all selected anodes")}updateAnodeSelection(){const e=document.getElementById("selectedAnodesList"),t=document.getElementById("selectedCount"),n=document.getElementById("anodeSubtotal");if(!e||!t)return;let o=0,i=0;const a=Object.entries(this.selectedAnodes||{}).filter(([s,r])=>r.quantity>0);a.length===0?e.innerHTML='<div style="color: #999;">No anodes selected</div>':e.innerHTML=a.map(([s,r])=>(o+=r.quantity,i+=r.quantity*r.price,`
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>${r.quantity}× ${r.name}</span>
                        <span>$${(r.quantity*r.price).toFixed(2)}</span>
                    </div>
                `)).join(""),t.textContent=o,n&&(n.textContent=i.toFixed(2)),this.currentServiceKey&&this.updateChargeSummary()}getSelectedAnodes(){let e=0,t=0;const n=[];return Object.entries(this.selectedAnodes||{}).forEach(([o,i])=>{i.quantity>0&&(e+=i.quantity,t+=i.quantity*i.price,n.push({sku:o,name:i.name,quantity:i.quantity,price:i.price,subtotal:i.quantity*i.price,inventory_id:i.inventory_id}))}),{count:e,totalPrice:t,items:n}}confirmWizardSelection(){this.calculateAdminPrice(),this.updateChargeSummary(),alert("Price calculated! Check the charge summary below.")}async loadRecentCustomers(){const e=document.getElementById("customerList");e.innerHTML='<div class="no-customers">Loading customers...</div>';try{const n=await(await fetch(`${ie}/stripe-customers?limit=10`)).json();this.customers=n.customers||[],this.displayCustomers()}catch(t){console.error("Error loading customers:",t),e.innerHTML='<div class="no-customers">Error loading customers</div>'}}async searchCustomers(){const e=document.getElementById("customerSearch").value.trim();if(!e){this.loadRecentCustomers();return}const t=document.getElementById("customerList");t.innerHTML='<div class="no-customers">Searching...</div>';try{const o=await(await fetch(`${ie}/stripe-customers?search=${encodeURIComponent(e)}`)).json();this.customers=o.customers||[],this.displayCustomers()}catch(n){console.error("Error searching customers:",n),t.innerHTML='<div class="no-customers">Error searching</div>'}}displayCustomers(){const e=document.getElementById("customerList");if(!this.customers||this.customers.length===0){e.innerHTML='<div class="no-customers">No customers found</div>';return}e.innerHTML=this.customers.map(t=>`
            <div class="customer-item" onclick="adminApp.selectCustomer('${t.id}')">
                <div class="customer-name">${t.name||"Unnamed Customer"}</div>
                <div class="customer-email">${t.email}</div>
                <span class="customer-payment ${t.payment_method?"has-card":"no-card"}">
                    ${t.payment_method?"✓ Card on file":"No card on file"}
                </span>
            </div>
        `).join("")}selectCustomer(e){if(this.selectedCustomer=this.customers.find(o=>o.id===e),!this.selectedCustomer)return;document.querySelectorAll(".customer-item").forEach(o=>{o.classList.remove("selected")});const t=document.querySelector(`[onclick*="${e}"]`);t&&t.classList.add("selected");const n=document.getElementById("selectedCustomer");n.innerHTML=`
            <div class="selected-info">
                Selected: ${this.selectedCustomer.name||"Unnamed"} (${this.selectedCustomer.email})
                ${this.selectedCustomer.payment_method?" - Card ending in "+this.selectedCustomer.payment_method.card.last4:" - No card on file"}
            </div>
        `,this.updateChargeSummary()}updateChargeSummary(){var s,r,d;if(window.updateWizardPricing&&(this.currentServiceKey==="recurring_cleaning"||this.currentServiceKey==="onetime_cleaning"||this.currentServiceKey==="anodes_only")){window.updateWizardPricing();return}const e=document.getElementById("chargeDetails"),t=document.getElementById("chargeButton"),n=window.serviceData&&this.currentServiceKey?window.serviceData[this.currentServiceKey]:null,o=(n==null?void 0:n.name)||"",i=document.getElementById("totalCostDisplay")||document.getElementById("totalCost");let a=0;if(i){const c=i.value||i.textContent||"0";a=parseFloat(c.replace("$","").replace(",",""))||0}if(a===0&&n&&n.type==="flat"&&n.rate&&(a=n.rate),this.currentServiceKey){let c=document.getElementById("chargeSummaryContent");c||(c=document.createElement("div"),c.id="chargeSummaryContent",e.innerHTML="",e.appendChild(c));let m=`
                <div class="charge-detail-row">
                    <span>Service:</span>
                    <span>${o||this.currentServiceKey}</span>
                </div>`;if(this.surchargeDetails&&(n==null?void 0:n.type)==="per_foot"){const y=parseFloat((s=document.getElementById("boatLength"))==null?void 0:s.value)||30,u=n.rate||0;m+=`
                <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                    <span>Calculation:</span>
                    <span>${y}ft × $${u.toFixed(2)}/ft = $${this.surchargeDetails.base.toFixed(2)}</span>
                </div>`;const g=[];if(this.surchargeDetails.hull>0){const h=this.surchargeDetails.hull===25?"Catamaran":"Trimaran";g.push(`${h} +${this.surchargeDetails.hull}%`)}if(this.surchargeDetails.growth>0){const h=((r=document.getElementById("growthLabel"))==null?void 0:r.textContent)||"Growth";g.push(`${h} growth +${this.surchargeDetails.growth.toFixed(0)}%`)}if(this.surchargeDetails.powerboat>0&&g.push(`Powerboat +${this.surchargeDetails.powerboat}%`),this.surchargeDetails.engines>0&&g.push(`Twin engines +${this.surchargeDetails.engines}%`),g.length>0&&(m+=`
                <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                    <span>Surcharges:</span>
                    <span>${g.join(", ")}</span>
                </div>`),this.currentServiceKey.includes("cleaning")){const h=((d=document.getElementById("actualPaintCondition"))==null?void 0:d.value)||"excellent",w=h.charAt(0).toUpperCase()+h.slice(1);m+=`
                <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                    <span>Paint Condition:</span>
                    <span>${w}</span>
                </div>`}}if(this.anodeDetails&&this.anodeDetails.count>0){this.anodeDetails.items&&this.anodeDetails.items.length>0&&this.anodeDetails.items.forEach(u=>{m+=`
                        <div class="charge-detail-row" style="font-size: 11px; color: #666; padding-left: 10px;">
                            <span>${u.quantity}× ${u.name}</span>
                            <span>$${u.subtotal.toFixed(2)}</span>
                        </div>`}),m+=`
                <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                    <span><strong>Anodes Subtotal (${this.anodeDetails.count} items):</strong></span>
                    <span><strong>$${this.anodeDetails.totalPrice.toFixed(2)}</strong></span>
                </div>`;const y=this.anodeDetails.count*15;m+=`
                <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                    <span>Anode Labor (${this.anodeDetails.count} × $15):</span>
                    <span>$${y.toFixed(2)}</span>
                </div>`,a+=this.anodeDetails.totalPrice+y}if(this.propellerDetails&&this.currentServiceKey==="propeller_service"){const y=this.propellerDetails;m+=`
                <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                    <span>Propellers:</span>
                    <span>${y.count}</span>
                </div>`,y.removal&&(m+=`
                    <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                        <span>Removal (${y.count} × $349):</span>
                        <span>$${(y.count*349).toFixed(2)}</span>
                    </div>`),y.install&&(m+=`
                    <div class="charge-detail-row" style="font-size: 12px; color: #666;">
                        <span>Installation (${y.count} × $349):</span>
                        <span>$${(y.count*349).toFixed(2)}</span>
                    </div>`),a=y.price}m+=`
                <div class="charge-detail-row">
                    <span>Total Price:</span>
                    <span style="font-weight: 600; color: #345475;">$${a.toFixed(2)}</span>
                </div>`,this.selectedCustomer?(m+=`
                <div class="charge-detail-row">
                    <span>Customer:</span>
                    <span>${this.selectedCustomer.name||this.selectedCustomer.email}</span>
                </div>`,this.selectedCustomer.payment_method?m+=`
                <div class="charge-detail-row">
                    <span>Payment:</span>
                    <span>Card ending in ${this.selectedCustomer.payment_method.card.last4}</span>
                </div>`:m+=`
                <div class="charge-detail-row">
                    <span>Payment:</span>
                    <span style="color: #e74c3c;">No card on file</span>
                </div>`):m+=`
                <div class="charge-detail-row">
                    <span>Customer:</span>
                    <span style="color: #999;">Not selected (will prompt)</span>
                </div>`,m+=`
                <div class="charge-detail-row" style="border-top: 2px solid #345475; padding-top: 10px; margin-top: 10px;">
                    <span><strong>Amount to Charge:</strong></span>
                    <span><strong>$${a.toFixed(2)}</strong></span>
                </div>`,c.innerHTML=m}else{let c=document.getElementById("chargeSummaryContent");c||(c=document.createElement("div"),c.id="chargeSummaryContent",e.innerHTML="",e.appendChild(c)),c.innerHTML='<div style="text-align: center; color: #7f8c8d;">Select a customer and configure service details</div>'}t.disabled=!1,a>0?t.textContent=`💳 Charge $${a.toFixed(2)}`:t.textContent="💳 Charge Customer"}async chargeCustomer(){var i,a,s;if(!this.currentServiceKey){alert("Please select a service first");return}const e=(i=document.getElementById("wizardCustomerName"))==null?void 0:i.value,t=(a=document.getElementById("wizardCustomerEmail"))==null?void 0:a.value,n=(s=document.getElementById("wizardCustomerPhone"))==null?void 0:s.value;let o;if(this.finalPrice!==void 0&&this.finalPrice!==null)o=this.finalPrice;else{const r=document.getElementById("totalCostDisplay");o=r?parseFloat(r.textContent.replace("$","").replace(",","")):0}this.currentChargeAmount=o,this.openUnifiedPaymentModal({name:e,email:t,phone:n,amount:o})}openCustomerModal(){const e=document.getElementById("customerSelectionModal");e&&(e.style.display="block",document.getElementById("modalCustomerName").value="",document.getElementById("modalCustomerEmail").value="",document.getElementById("modalCustomerPhone").value="",document.getElementById("modalBoatName").value="",document.getElementById("modalBoatLength").value="",document.getElementById("modalBoatMake").value="",document.getElementById("modalBoatModel").value="")}openUnifiedPaymentModal(e){var c,m,y,u,g,h,w,v;const t=document.getElementById("customerSelectionModal");if(!t)return;e.name&&(document.getElementById("modalCustomerName").value=e.name),e.email&&(document.getElementById("modalCustomerEmail").value=e.email),e.phone&&(document.getElementById("modalCustomerPhone").value=e.phone);const n=((c=document.getElementById("wizardBoatLength"))==null?void 0:c.value)||((m=document.getElementById("boat_length"))==null?void 0:m.value),o=((y=document.getElementById("wizardBoatName"))==null?void 0:y.value)||((u=document.getElementById("boat_name"))==null?void 0:u.value),i=((g=document.getElementById("wizardBoatMake"))==null?void 0:g.value)||((h=document.getElementById("boat_make"))==null?void 0:h.value),a=((w=document.getElementById("wizardBoatModel"))==null?void 0:w.value)||((v=document.getElementById("boat_model"))==null?void 0:v.value);n&&(document.getElementById("modalBoatLength").value=n),o&&(document.getElementById("modalBoatName").value=o),i&&(document.getElementById("modalBoatMake").value=i),a&&(document.getElementById("modalBoatModel").value=a);const s=document.getElementById("modalPaymentSection");s&&(s.style.display="block");const r=document.getElementById("modalChargeAmount");r&&e.amount&&(r.textContent=`($${e.amount.toFixed(2)})`);const d=document.getElementById("modalPaymentInfo");d&&(d.textContent="Enter payment card information below to complete the charge."),this.initializeModalStripeElements(),t.style.display="block"}openCustomerModalWithData(e){var n,o,i,a,s,r,d,c;const t=document.getElementById("customerSelectionModal");if(t){t.style.display="block",e.name&&(document.getElementById("modalCustomerName").value=e.name),e.email&&(document.getElementById("modalCustomerEmail").value=e.email),e.phone&&(document.getElementById("modalCustomerPhone").value=e.phone);const m=((n=document.getElementById("wizardBoatLength"))==null?void 0:n.value)||((o=document.getElementById("boat_length"))==null?void 0:o.value),y=((i=document.getElementById("wizardBoatName"))==null?void 0:i.value)||((a=document.getElementById("boat_name"))==null?void 0:a.value),u=((s=document.getElementById("wizardBoatMake"))==null?void 0:s.value)||((r=document.getElementById("boat_make"))==null?void 0:r.value),g=((d=document.getElementById("wizardBoatModel"))==null?void 0:d.value)||((c=document.getElementById("boat_model"))==null?void 0:c.value);m&&(document.getElementById("modalBoatLength").value=m),y&&(document.getElementById("modalBoatName").value=y),u&&(document.getElementById("modalBoatMake").value=u),g&&(document.getElementById("modalBoatModel").value=g)}}initializeModalStripeElements(){var t;if(typeof Stripe>"u"){console.error("Stripe.js not loaded");return}const e=((t=window.ENV)==null?void 0:t.VITE_STRIPE_PUBLISHABLE_KEY)||"pk_live_pri1IepedMvGQmLCFrV4kVzF";this.stripe||(this.stripe=Stripe(e)),this.modalCardElement||(this.modalElements=this.stripe.elements(),this.modalCardElement=this.modalElements.create("card",{style:{base:{fontSize:"16px",color:"#32325d",fontFamily:'"Helvetica Neue", Helvetica, sans-serif',"::placeholder":{color:"#aab7c4"}},invalid:{color:"#fa755a",iconColor:"#fa755a"}}}),this.modalCardElement.mount("#modal-card-element"),this.modalCardElement.on("change",n=>{const o=document.getElementById("modal-card-errors");n.error?o.textContent=n.error.message:o.textContent=""}))}closeCustomerModal(){const e=document.getElementById("customerSelectionModal");if(e){e.style.display="none";const t=document.getElementById("modalPaymentSection");t&&(t.style.display="none")}}async processCustomerAndPayment(){const e=document.getElementById("modalCustomerName").value,t=document.getElementById("modalCustomerEmail").value,n=document.getElementById("modalCustomerPhone").value,o=document.getElementById("modalBoatName").value,i=document.getElementById("modalBoatLength").value,a=document.getElementById("modalBoatMake").value,s=document.getElementById("modalBoatModel").value;if(!e||!t){alert("Please provide at least name and email");return}const r=document.getElementById("modalChargeButton"),d=r.textContent;r.disabled=!0,r.textContent="Processing...";try{const{data:c}=await window.supabase.from("customers").select("*").eq("email",t);let m=c&&c.length>0?c[0]:null;if(!m){const{data:v,error:I}=await window.supabase.from("customers").insert([{name:e,email:t,phone:n}]).select().single();if(I)throw new Error("Failed to create customer: "+I.message);m=v,o&&await window.supabase.from("boats").insert([{customer_id:m.id,name:o,make:a,model:s,length:i?parseInt(i):null}])}const{paymentMethod:y,error:u}=await this.stripe.createPaymentMethod({type:"card",card:this.modalCardElement,billing_details:{name:e,email:t,phone:n}});if(u)throw new Error(u.message);const g=this.currentChargeAmount||0,{data:h,error:w}=await window.supabase.functions.invoke("create-charge",{body:{customerEmail:t,customerName:e,customerPhone:n,paymentMethodId:y.id,amount:g,description:`Service: ${this.currentServiceKey||"General Service"}`,metadata:{service:this.currentServiceKey||"unknown",customerSupabaseId:m.id,boatName:o||"N/A"}}});if(w)throw new Error(w.message||(h==null?void 0:h.error)||"Failed to process charge");!m.stripe_customer_id&&h.stripeCustomerId&&(await window.supabase.from("customers").update({stripe_customer_id:h.stripeCustomerId}).eq("id",m.id),m.stripe_customer_id=h.stripeCustomerId),this.selectedCustomer=m,window.selectedCustomer=m,alert(`✅ Successfully charged $${g.toFixed(2)} to ${e}!

Charge ID: ${h.chargeId}
Payment Intent: ${h.paymentIntentId}`),this.closeCustomerModal(),console.log("Charge completed successfully:",h)}catch(c){console.error("Error processing payment:",c);const m=document.getElementById("modal-card-errors");m?m.textContent=c.message:alert("Error processing payment: "+c.message),r.disabled=!1,r.textContent=d}}async confirmCustomerInfo(){const e=document.getElementById("modalCustomerName").value,t=document.getElementById("modalCustomerEmail").value,n=document.getElementById("modalCustomerPhone").value,o=document.getElementById("modalBoatName").value,i=document.getElementById("modalBoatLength").value,a=document.getElementById("modalBoatMake").value,s=document.getElementById("modalBoatModel").value;if(!e||!t){alert("Please provide at least name and email");return}if(window.modalSelectedCustomer){this.selectedCustomer=window.modalSelectedCustomer,this.closeCustomerModal(),this.chargeCustomer();return}try{const{data:r,error:d}=await window.supabase.from("customers").select("*").eq("email",t);let c=r&&r.length>0?r[0]:null;if(!c){const{data:m,error:y}=await window.supabase.from("customers").insert([{name:e,email:t,phone:n}]).select().single();if(y)throw console.error("Error creating customer:",y),new Error("Failed to create customer");if(c=m,o){const{data:u,error:g}=await window.supabase.from("boats").insert([{customer_id:c.id,name:o,make:a,model:s,length:i?parseInt(i):null}]).select().single();g&&console.error("Error creating boat:",g),u&&(c.boat=u)}window.customers||(window.customers=[]),window.customers.push(c)}c&&(this.selectedCustomer=c,window.selectedCustomer=c,document.getElementById("wizardCustomerName")&&(document.getElementById("wizardCustomerName").value=c.name||"",document.getElementById("wizardCustomerEmail").value=c.email||"",document.getElementById("wizardCustomerPhone").value=c.phone||"",window.selectedWizardCustomer=c),this.closeCustomerModal(),this.chargeCustomer())}catch(r){console.error("Error processing customer info:",r),alert("Error processing customer information: "+r.message)}}selectModalCustomer(e){this.modalSelectedCustomerId=e,document.querySelectorAll("#modalCustomerList .customer-item").forEach(t=>{t.classList.remove("selected")}),event.currentTarget.classList.add("selected")}filterModalCustomers(e){document.querySelectorAll("#modalCustomerList .customer-item").forEach(n=>{const o=n.textContent.toLowerCase();n.style.display=o.includes(e.toLowerCase())?"block":"none"})}showTab(e){const t=document.getElementById("existingCustomerTab"),n=document.getElementById("manualEntryTab"),o=document.querySelectorAll(".tab-button");e==="existing"?(t.style.display="block",n.style.display="none",o[0].classList.add("active"),o[1].classList.remove("active")):(t.style.display="none",n.style.display="block",o[0].classList.remove("active"),o[1].classList.add("active"))}async proceedWithSelectedCustomer(){if(!this.modalSelectedCustomerId){alert("Please select a customer");return}if(this.selectedCustomer=this.customers.find(e=>e.id===this.modalSelectedCustomerId),!this.selectedCustomer){alert("Customer not found");return}if(!this.selectedCustomer.payment_method)if(confirm("This customer has no payment method on file. Add one now?")){alert("Payment method form would open here");return}else return;this.closeCustomerModal(),this.updateChargeSummary(),this.chargeCustomer()}async proceedWithManualCustomer(){var a,s,r,d;const e=(a=document.getElementById("manualCustomerName"))==null?void 0:a.value,t=(s=document.getElementById("manualCustomerEmail"))==null?void 0:s.value,n=(r=document.getElementById("manualCustomerPhone"))==null?void 0:r.value,o=(d=document.getElementById("manualBoatName"))==null?void 0:d.value;if(!e||!t){alert("Please enter at least name and email");return}alert(`Would create customer: ${e} (${t})`);const i={id:"temp_"+Date.now(),name:e,email:t,phone:n,boat_name:o};this.customers.push(i),this.selectedCustomer=i,this.closeCustomerModal(),this.updateChargeSummary()}openPriceCustomization(e){this.originalPrice=e;let t=document.getElementById("priceCustomizationModal");if(t||(t=document.createElement("div"),t.id="priceCustomizationModal",t.className="modal",t.style.cssText=`
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            `,t.innerHTML=`
                <div class="modal-content" style="
                    background-color: #fefefe;
                    margin: 10% auto;
                    padding: 30px;
                    border: 1px solid #888;
                    width: 90%;
                    max-width: 400px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                ">
                    <span onclick="window.adminApp.closePriceCustomization()" style="
                        color: #aaa;
                        float: right;
                        font-size: 28px;
                        font-weight: bold;
                        cursor: pointer;
                        line-height: 20px;
                    ">&times;</span>

                    <h2 style="color: #345475; margin-bottom: 20px;">Customize Price</h2>

                    <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                        <strong>Original Price:</strong> $<span id="originalPriceDisplay">0.00</span>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px;">
                            <input type="radio" name="adjustmentType" value="percent" checked
                                onchange="window.adminApp.updateCustomizationPreview()">
                            Percentage Discount
                        </label>
                        <input type="number" id="percentValue" min="0" max="100" value="10"
                            style="width: 80px; padding: 5px; margin-left: 20px;"
                            oninput="window.adminApp.updateCustomizationPreview()">
                        <span>%</span>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px;">
                            <input type="radio" name="adjustmentType" value="dollar"
                                onchange="window.adminApp.updateCustomizationPreview()">
                            Dollar Amount Discount
                        </label>
                        <span style="margin-left: 20px;">$</span>
                        <input type="number" id="dollarValue" min="0" value="50" step="0.01"
                            style="width: 100px; padding: 5px;"
                            oninput="window.adminApp.updateCustomizationPreview()">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px;">
                            <input type="radio" name="adjustmentType" value="custom"
                                onchange="window.adminApp.updateCustomizationPreview()">
                            Custom Total Amount
                        </label>
                        <span style="margin-left: 20px;">$</span>
                        <input type="number" id="customValue" min="0" value="${e}" step="0.01"
                            style="width: 100px; padding: 5px;"
                            oninput="window.adminApp.updateCustomizationPreview()">
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 5px;">
                        <strong>Final Price:</strong>
                        <span style="font-size: 1.2em; color: #2e7d32;">$<span id="finalPricePreview">0.00</span></span>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button onclick="window.adminApp.applyPriceCustomization()"
                            style="flex: 1; padding: 10px; background: #345475; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Apply
                        </button>
                        <button onclick="window.adminApp.clearPriceCustomization()"
                            style="flex: 1; padding: 10px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Clear Discount
                        </button>
                    </div>
                </div>
            `,document.body.appendChild(t)),document.getElementById("originalPriceDisplay").textContent=e.toFixed(2),document.getElementById("customValue").value=e.toFixed(2),this.priceAdjustment){const n=document.getElementsByName("adjustmentType");for(let o of n)if(o.value===this.priceAdjustment.type){o.checked=!0;break}this.priceAdjustment.type==="percent"?document.getElementById("percentValue").value=this.priceAdjustment.value:this.priceAdjustment.type==="dollar"?document.getElementById("dollarValue").value=this.priceAdjustment.value:this.priceAdjustment.type==="custom"&&(document.getElementById("customValue").value=this.priceAdjustment.value)}this.updateCustomizationPreview(),t.style.display="block"}closePriceCustomization(){const e=document.getElementById("priceCustomizationModal");e&&(e.style.display="none")}updateCustomizationPreview(){var n;const e=(n=document.querySelector('input[name="adjustmentType"]:checked'))==null?void 0:n.value;let t=this.originalPrice;if(e==="percent"){const o=parseFloat(document.getElementById("percentValue").value)||0;t=this.originalPrice*(1-o/100)}else if(e==="dollar"){const o=parseFloat(document.getElementById("dollarValue").value)||0;t=Math.max(0,this.originalPrice-o)}else e==="custom"&&(t=parseFloat(document.getElementById("customValue").value)||0);document.getElementById("finalPricePreview").textContent=t.toFixed(2)}applyPriceCustomization(){var t;const e=(t=document.querySelector('input[name="adjustmentType"]:checked'))==null?void 0:t.value;if(e==="percent"){const n=parseFloat(document.getElementById("percentValue").value)||0;this.priceAdjustment={type:"percent",value:n}}else if(e==="dollar"){const n=parseFloat(document.getElementById("dollarValue").value)||0;this.priceAdjustment={type:"dollar",value:n}}else if(e==="custom"){const n=parseFloat(document.getElementById("customValue").value)||0;this.priceAdjustment={type:"custom",value:n}}this.closePriceCustomization(),window.updateWizardPricing&&window.updateWizardPricing(),this.updateChargeSummary()}clearPriceCustomization(){this.priceAdjustment=null,this.finalPrice=null,this.closePriceCustomization(),window.updateWizardPricing&&window.updateWizardPricing(),this.updateChargeSummary()}generateQuote(){console.log("Generate quote clicked");const e=this.calculateTotalCost();if(!e||e<=0){alert("Please select a service and configure options first");return}this.selectedCustomer?this.proceedWithQuote():this.openQuoteModal()}openQuoteModal(){const e=document.getElementById("quoteCustomerModal");if(!e){console.error("Quote modal not found");return}document.getElementById("quoteCustName").value="",document.getElementById("quoteCustEmail").value="",document.getElementById("quoteCustPhone").value="",document.getElementById("quoteBoatName").value="",document.getElementById("quoteBoatMake").value="",document.getElementById("quoteMarina").value="",document.getElementById("quoteSlip").value="",document.getElementById("quoteSendEmail").checked=!0,document.getElementById("quoteGeneratePDF").checked=!0,document.getElementById("quoteValidDays").value="30",e.style.display="block"}closeQuoteModal(){const e=document.getElementById("quoteCustomerModal");e&&(e.style.display="none")}async proceedWithQuote(){var c,m,y,u,g,h,w,v,I,L;console.log("Proceeding with quote generation");let e;if(this.selectedCustomer)e={name:this.selectedCustomer.name,email:this.selectedCustomer.email,phone:this.selectedCustomer.phone,boatName:this.selectedCustomer.boat_name||"",boatMake:this.selectedCustomer.boat_make||"",marina:this.selectedCustomer.marina||"",slip:this.selectedCustomer.slip||""};else{const $=(c=document.getElementById("quoteCustName"))==null?void 0:c.value,B=(m=document.getElementById("quoteCustEmail"))==null?void 0:m.value,k=(y=document.getElementById("quoteCustPhone"))==null?void 0:y.value,M=(u=document.getElementById("quoteBoatName"))==null?void 0:u.value,q=(g=document.getElementById("quoteBoatMake"))==null?void 0:g.value,P=(h=document.getElementById("quoteMarina"))==null?void 0:h.value,A=(w=document.getElementById("quoteSlip"))==null?void 0:w.value;if(!$||!B||!k||!M){alert("Please fill in all required fields");return}e={name:$,email:B,phone:k,boatName:M,boatMake:q,marina:P,slip:A}}const t=((v=document.getElementById("quoteSendEmail"))==null?void 0:v.checked)??!0,n=((I=document.getElementById("quoteGeneratePDF"))==null?void 0:I.checked)??!0,o=parseInt(((L=document.getElementById("quoteValidDays"))==null?void 0:L.value)||"30"),i=this.generateQuoteNumber(),a=new Date,s=new Date;s.setDate(s.getDate()+o);const r={quoteNumber:i,quoteDate:a.toISOString(),expiryDate:s.toISOString(),validDays:o,customer:e,service:this.buildServiceDetails(),anodes:this.buildAnodeDetails(),pricing:this.buildPricingDetails(),options:{sendEmail:t,generatePDF:n}};console.log("Quote data prepared:",r),this.closeQuoteModal();const d=document.getElementById("chargeResult");d&&(d.innerHTML=`
                <div class="success-result">
                    <h3>📋 Generating Quote #${i}...</h3>
                    <div class="loading-spinner"></div>
                </div>
            `,d.style.display="block");try{let $=!1,B=`${window.location.origin}/quote/${i}`;try{const k=await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(k.ok){const M=await k.json();console.log("Quote saved to database:",M),$=!0}else console.warn("Could not save to database, continuing without persistence")}catch(k){console.warn("Database not available, continuing without persistence:",k)}d&&(d.innerHTML=`
                    <div class="success-result">
                        <h3>✅ Quote Generated Successfully!</h3>
                        <div class="quote-details">
                            <p><strong>Quote Number:</strong> ${i}</p>
                            <p><strong>Customer:</strong> ${e.name}</p>
                            <p><strong>Boat:</strong> ${e.boatName}</p>
                            <p><strong>Total:</strong> $${this.calculateTotalCost().toFixed(2)}</p>
                            <p><strong>Valid Until:</strong> ${s.toLocaleDateString()}</p>
                            ${n?"<p>📄 PDF available for download</p>":""}
                            ${$?"<p>✅ Quote saved to database</p>":"<p>⚠️ Quote generated locally (database unavailable)</p>"}
                            ${$?`<p><strong>Online Quote:</strong> <a href="${B}" target="_blank">${B}</a></p>`:""}
                        </div>
                        <div class="quote-actions">
                            ${n?`<button onclick="adminApp.downloadQuotePDF('${i}')" class="btn-primary">📥 Download PDF</button>`:""}
                            ${$?`<button onclick="adminApp.viewQuoteOnline('${i}')" class="btn-secondary">🌐 View Online</button>`:""}
                            <button onclick="adminApp.createNewQuote()" class="btn-secondary">📋 New Quote</button>
                        </div>
                    </div>
                `),this.lastQuote=r}catch($){console.error("Error generating quote:",$),d&&(d.innerHTML=`
                    <div class="error-result">
                        <h3>❌ Error Generating Quote</h3>
                        <p>${$.message||"An unexpected error occurred"}</p>
                        <button onclick="adminApp.generateQuote()" class="btn-primary">Try Again</button>
                    </div>
                `)}}generateQuoteNumber(){const e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0"),i=String(Math.floor(Math.random()*1e4)).padStart(4,"0");return`QT-${t}${n}${o}-${i}`}buildServiceDetails(){var a,s,r,d,c;const e=window.serviceData[this.currentServiceKey];if(!e)return null;const t=parseFloat(((a=document.getElementById("boatLength"))==null?void 0:a.value)||0),n=((s=document.getElementById("actualPaintCondition"))==null?void 0:s.value)||"",o=((r=document.getElementById("actualGrowthLevel"))==null?void 0:r.value)||"",i=((d=document.getElementById("has_twin_engines"))==null?void 0:d.value)==="true";return{type:this.currentServiceKey,name:e.name,boatLength:t,paintCondition:n,growthLevel:o,hasTwinEngines:i,additionalHulls:parseInt(((c=document.getElementById("additionalHulls"))==null?void 0:c.value)||0)}}buildAnodeDetails(){const e=[];for(const[t,n]of Object.entries(this.selectedAnodes))if(n>0&&this.anodeDetails&&this.anodeDetails[t]){const o=this.anodeDetails[t];e.push({sku:t,name:o.name,quantity:n,unitPrice:o.price,totalPrice:n*o.price})}return e}buildPricingDetails(){var r,d;const e=this.calculateTotalCost(),t=window.serviceData[this.currentServiceKey],n=parseFloat(((r=document.getElementById("boatLength"))==null?void 0:r.value)||0),o=((d=t==null?void 0:t.pricing)==null?void 0:d.base)||0,i=n*o;let a=0,s=0;for(const[c,m]of Object.entries(this.selectedAnodes))m>0&&this.anodeDetails&&this.anodeDetails[c]&&(a+=m*this.anodeDetails[c].price,s+=m*15);return{basePrice:i,boatLength:n,ratePerFoot:o,anodeCost:a,anodeLaborCost:s,totalCost:e,currency:"USD"}}generatePDF(e){const t=new window.jspdf.jsPDF;t.setFontSize(24),t.setTextColor(41,98,255),t.text("SAILOR SKILLS",105,20,{align:"center"}),t.setFontSize(10),t.setTextColor(100),t.text("Professional Underwater Services",105,27,{align:"center"}),t.setFontSize(18),t.setTextColor(0),t.text("SERVICE QUOTE",105,40,{align:"center"}),t.setFontSize(10),t.setTextColor(60),t.text(`Quote #: ${e.quoteNumber}`,20,55),t.text(`Date: ${new Date(e.quoteDate).toLocaleDateString()}`,20,62),t.text(`Valid Until: ${new Date(e.expiryDate).toLocaleDateString()}`,20,69),t.setFontSize(12),t.setTextColor(0),t.text("CUSTOMER INFORMATION",20,85),t.setLineWidth(.5),t.line(20,87,190,87),t.setFontSize(10),t.text(`Name: ${e.customer.name}`,20,95),t.text(`Email: ${e.customer.email}`,20,102),t.text(`Phone: ${e.customer.phone}`,20,109),t.text(`Boat: ${e.customer.boatName}`,120,95),e.customer.boatMake&&t.text(`Make/Model: ${e.customer.boatMake}`,120,102),e.customer.marina&&t.text(`Marina: ${e.customer.marina}`,120,109),e.customer.slip&&t.text(`Slip: ${e.customer.slip}`,120,116);let n=130;return t.setFontSize(12),t.text("SERVICE DETAILS",20,n),t.line(20,n+2,190,n+2),n+=10,t.setFontSize(10),e.service&&(t.text(`Service Type: ${e.service.name}`,20,n),n+=7,t.text(`Boat Length: ${e.service.boatLength} ft`,20,n),n+=7,e.service.paintCondition&&(t.text(`Paint Condition: ${e.service.paintCondition}`,20,n),n+=7),e.service.growthLevel&&(t.text(`Growth Level: ${e.service.growthLevel}`,20,n),n+=7),e.service.hasTwinEngines&&(t.text("Twin Engines: Yes",20,n),n+=7),e.service.additionalHulls>0&&(t.text(`Additional Hulls: ${e.service.additionalHulls}`,20,n),n+=7)),e.anodes&&e.anodes.length>0&&(n+=10,t.setFontSize(12),t.text("ZINC ANODES",20,n),t.line(20,n+2,190,n+2),n+=10,t.setFontSize(10),e.anodes.forEach(o=>{const i=`${o.quantity}x ${o.name}`,a=`$${o.totalPrice.toFixed(2)}`;t.text(i,20,n),t.text(a,170,n,{align:"right"}),n+=7})),n+=10,t.setFontSize(12),t.text("PRICING BREAKDOWN",20,n),t.line(20,n+2,190,n+2),n+=10,t.setFontSize(10),e.pricing&&(e.pricing.basePrice>0&&(t.text(`Service (${e.pricing.boatLength}ft × $${e.pricing.ratePerFoot}/ft):`,20,n),t.text(`$${e.pricing.basePrice.toFixed(2)}`,170,n,{align:"right"}),n+=7),e.pricing.anodeCost>0&&(t.text("Anodes:",20,n),t.text(`$${e.pricing.anodeCost.toFixed(2)}`,170,n,{align:"right"}),n+=7),e.pricing.anodeLaborCost>0&&(t.text("Anode Installation:",20,n),t.text(`$${e.pricing.anodeLaborCost.toFixed(2)}`,170,n,{align:"right"}),n+=7),n+=5,t.setLineWidth(.5),t.line(120,n,190,n),n+=7,t.setFontSize(12),t.setFont(void 0,"bold"),t.text("TOTAL:",20,n),t.text(`$${e.pricing.totalCost.toFixed(2)}`,170,n,{align:"right"}),t.setFont(void 0,"normal")),t.setFontSize(8),t.setTextColor(100),t.text("This quote is valid for the period specified above.",105,280,{align:"center"}),t.text("Terms and conditions apply. Payment due upon completion of service.",105,285,{align:"center"}),t}downloadQuotePDF(e){if(console.log("Generating PDF for quote:",e),!this.lastQuote){console.error("No quote data available");return}try{const t=this.generatePDF(this.lastQuote),n=`quote-${e}.pdf`;if(navigator.share&&/mobile|android|ios/i.test(navigator.userAgent)){const o=t.output("blob"),i=new File([o],n,{type:"application/pdf"});navigator.share({title:`Quote ${e}`,text:`Service quote for ${this.lastQuote.customer.name}`,files:[i]}).then(()=>{console.log("Quote shared successfully")}).catch(a=>{console.log("Share cancelled or failed, downloading instead:",a),t.save(n)})}else t.save(n)}catch(t){console.error("Error generating PDF:",t),alert("Error generating PDF. Please try again.")}}viewQuoteOnline(e){console.log("View online quote:",e);const t=`${window.location.origin}/quote/${e}`;window.open(t,"_blank")}createNewQuote(){document.getElementById("chargeResult").style.display="none",this.selectedCustomer=null,this.selectedAnodes={},this.currentServiceKey=null,document.getElementById("selectedCustomerInfo").textContent="",document.getElementById("simpleServiceButtons").style.display="flex",document.getElementById("wizardContainer").style.display="none",this.updateChargeSummary()}calculateTotalCost(){const e=document.getElementById("totalCostDisplay");if(e){const t=e.textContent||"$0";return parseFloat(t.replace("$","").replace(",",""))||0}return 0}}const pe=new fe;window.adminApp=pe;window.updateChargeSummary&&(console.log("Replacing updateChargeSummary stub with real implementation"),window.updateChargeSummary=()=>pe.updateChargeSummary());let le=null,U=[];window.searchModalCustomer=async function(l){le&&clearTimeout(le);const e=document.getElementById("modalCustomerSearchResults");if(!l||l.length<2){e.style.display="none",window.modalSelectedCustomer=null,U=[];return}le=setTimeout(async()=>{try{const n=await(await fetch(`${ie}/stripe-customers?search=${encodeURIComponent(l)}`)).json();n&&n.length>0?(U=n,e.innerHTML=n.map(o=>`
                    <div onclick="window.selectModalCustomer('${o.id}')"
                         style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;"
                         onmouseover="this.style.backgroundColor='#f0f0f0'"
                         onmouseout="this.style.backgroundColor='white'">
                        <div style="font-weight: 500;">${o.name||"Unnamed"}</div>
                        <div style="font-size: 12px; color: #666;">${o.email}</div>
                        ${o.boat_name?`<div style="font-size: 12px; color: #666;">Boat: ${o.boat_name}</div>`:""}
                    </div>
                `).join(""),e.style.display="block"):(U=[],e.innerHTML='<div style="padding: 10px; color: #666;">No customers found - new customer will be created</div>',e.style.display="block",window.modalSelectedCustomer=null)}catch(t){console.error("Error searching customers:",t),e.style.display="none",U=[]}},300)};window.selectModalCustomer=async function(l){try{const t=await(await fetch(`${ie}/stripe-customers?customerId=${l}`)).json();if(t){document.getElementById("modalCustomerName").value=t.name||"",document.getElementById("modalCustomerEmail").value=t.email||"",document.getElementById("modalCustomerPhone").value=t.phone||"",document.getElementById("modalBoatName").value=t.boat_name||"",document.getElementById("modalBoatLength").value=t.boat_length||"",document.getElementById("modalBoatMake").value=t.boat_make||"",document.getElementById("modalBoatModel").value=t.boat_model||"",document.getElementById("modalCustomerSearchResults").style.display="none";const n=document.getElementById("modalPaymentMethodInfo"),o=document.getElementById("modalPaymentMethodDetails");if(t.payment_methods&&t.payment_methods.length>0){const i=t.payment_methods[0],a=i.card.brand.charAt(0).toUpperCase()+i.card.brand.slice(1),s=i.card.last4,r=String(i.card.exp_month).padStart(2,"0"),d=String(i.card.exp_year).slice(-2);o.textContent=`${a} •••• ${s} (exp ${r}/${d})`,n.style.display="block",window.modalSelectedPaymentMethodId=i.id}else n.style.display="none",window.modalSelectedPaymentMethodId=null;window.modalSelectedCustomer=t}}catch(e){console.error("Error fetching customer details:",e)}};document.addEventListener("click",function(l){const e=document.getElementById("modalCustomerSearchResults"),t=document.getElementById("modalCustomerName");e&&t&&!t.contains(l.target)&&!e.contains(l.target)&&(e.style.display="none")});document.addEventListener("keydown",function(l){const e=document.getElementById("modalCustomerName");l.target===e&&l.key==="Enter"&&(l.preventDefault(),U&&U.length>0&&window.selectModalCustomer(U[0].id))});window.selectServiceDirect=l=>{console.log("selectServiceDirect called with:",l),pe.selectService(l)};const b={MINIMUM_SERVICE_FEE:150,TAX_RATE:.1075,ANODE_MARKUP_RATE:.2,ANODE_LABOR_PER_UNIT:15,RATES:{RECURRING_CLEANING:4.5,ONETIME_CLEANING:6,UNDERWATER_INSPECTION:4,ITEM_RECOVERY:199,PROPELLER_SERVICE:349,ANODES_ONLY:150},SURCHARGES:{POWERBOAT:.25,CATAMARAN:.25,TRIMARAN:.5,TWIN_ENGINES:.1,POOR_PAINT:.1,MISSING_PAINT:.15,LIGHT_HEAVY_GROWTH:.25,MODERATE_HEAVY_GROWTH:.5,HEAVY_GROWTH:.75,VERY_HEAVY_GROWTH:1,SEVERE_GROWTH:1.5,EXTREME_GROWTH:2},PAYMENT:{DEPOSIT_PERCENTAGE:.5,NET_DAYS:30,LATE_FEE_PERCENTAGE:.015},INTERVALS:{WEEKLY:.25,BIWEEKLY:.5,MONTHLY:1,BIMONTHLY:2,QUARTERLY:3,SEMIANNUAL:6,ANNUAL:12},BOAT_SIZES:{SMALL:{min:0,max:30},MEDIUM:{min:31,max:45},LARGE:{min:46,max:60},XLARGE:{min:61,max:100}},CONTACT:{PHONE:"(555) 123-4567",EMAIL:"info@sailorskills.com",WEBSITE:"https://www.sailorskills.com"},HOURS:{WEEKDAY_START:"8:00 AM",WEEKDAY_END:"5:00 PM",WEEKEND_START:"9:00 AM",WEEKEND_END:"3:00 PM"}},we=me();window.wizardCurrentStep=0;window.wizardSteps=[];window.serviceData={recurring_cleaning:{rate:b.RATES.RECURRING_CLEANING,name:"Recurring Cleaning & Anodes",type:"per_foot",description:"Regular hull cleaning keeps your boat performing at its best. Service includes cleaning and zinc anode inspection. Available at 1, 2, 3, or 6-month intervals."},onetime_cleaning:{rate:b.RATES.ONETIME_CLEANING,name:"One-time Cleaning & Anodes",type:"per_foot",description:"Complete hull cleaning and zinc anode inspection. Perfect for pre-haul out, pre-survey, or when your regular diver is unavailable."},item_recovery:{rate:b.RATES.ITEM_RECOVERY,name:"Item Recovery",type:"flat",description:"Professional recovery of lost items like phones, keys, tools, or dinghies. Quick response to minimize water damage. Service includes up to 45 minutes of searching time. Recovery is not guaranteed."},underwater_inspection:{rate:b.RATES.UNDERWATER_INSPECTION,name:"Underwater Inspection",type:"per_foot",description:`Thorough underwater inspection with detailed photo/video documentation. Ideal for insurance claims, pre-purchase surveys, or damage assessment. $${b.RATES.UNDERWATER_INSPECTION} per foot with $${b.MINIMUM_SERVICE_FEE} minimum.`},propeller_service:{rate:b.RATES.PROPELLER_SERVICE,name:"Propeller Removal/Installation",type:"flat",description:`Professional propeller removal or installation service. $${b.RATES.PROPELLER_SERVICE} per propeller for either service. Includes proper handling, alignment, and torque specifications.`},anodes_only:{rate:b.RATES.ANODES_ONLY,name:"Anodes Only",type:"flat",description:`Zinc anode inspection and replacement service. $${b.MINIMUM_SERVICE_FEE} minimum service charge plus cost of anodes. Perfect for boats that only need anode replacement without hull cleaning.`}};const Ae=function(l){document.querySelectorAll('.option-button[class*="paint-"]').forEach(o=>{o.classList.remove("selected")});const e=document.querySelector(`.option-button.paint-${l}`);e&&e.classList.add("selected");const t=document.getElementById("wizardPaintCondition");t&&(t.value=l),document.querySelectorAll('.option-button[data-value="'+l+'"]').forEach(o=>{o.classList.contains("paint-"+l)&&o.classList.add("selected")});const n=document.getElementById("paint_condition");n&&(n.value=l),window.calculateCost&&window.calculateCost(),window.updateChargeSummary&&window.updateChargeSummary(),window.updateWizardPricing&&window.updateWizardPricing()};window.selectWizardPaintCondition=Ae;const _e=function(l,e){var y,u;console.log("Full renderConsolidatedForm called for",e);const t=document.getElementById("wizardContainer"),n=document.getElementById("wizardContent"),o=document.getElementById("simpleServiceButtons");if(!t||!n){console.error("Wizard elements not found");return}t.style.display="block",o&&(o.style.display="none"),setTimeout(()=>{const I=(t.querySelector("input, select, textarea")||t).getBoundingClientRect().top+window.pageYOffset-60-10;window.scrollTo({top:Math.max(0,I),behavior:"smooth"})},200);const i=window.serviceData?window.serviceData[e]:null,a=i?i.name:"Service",s=e==="underwater_inspection",r=e==="anodes_only",d=s;n.innerHTML="";let c='<div class="consolidated-form">';c+=`
        <div class="form-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #2c3e50;">${a}</h2>
            <button onclick="backToServices()" class="back-btn" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                ← Back to Services
            </button>
        </div>
    `,c+=`
        <div class="form-section customer-info-section" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #495057;">Customer Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label for="wizardCustomerName" style="display: block; margin-bottom: 5px; color: #495057;">Name</label>
                    <div style="position: relative;">
                        <input type="text"
                               id="wizardCustomerName"
                               placeholder="Start typing to search..."
                               style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px;"
                               oninput="window.searchCustomerByName(this.value)"
                               autocomplete="off">
                        <div id="customerSearchResults" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ced4da; border-radius: 5px; max-height: 200px; overflow-y: auto; display: none; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="wizardCustomerEmail" style="display: block; margin-bottom: 5px; color: #495057;">Email</label>
                    <input type="email"
                           id="wizardCustomerEmail"
                           placeholder="customer@example.com"
                           style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px;">
                </div>
                <div class="form-group">
                    <label for="wizardCustomerPhone" style="display: block; margin-bottom: 5px; color: #495057;">Phone</label>
                    <input type="tel"
                           id="wizardCustomerPhone"
                           placeholder="(555) 123-4567"
                           style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px;">
                </div>
            </div>

            <!-- Payment Method Info Display -->
            <div id="wizardPaymentInfo" style="display: none; margin-top: 15px; padding: 12px; background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #2e7d32;">
                    <span style="font-size: 18px;">💳</span>
                    <span id="wizardPaymentDetails" style="font-weight: 500;"></span>
                    <span style="color: #4caf50; font-size: 16px;">✓</span>
                </div>
            </div>
        </div>
    `;const m=i&&i.type==="per_foot";if(c+=`
        <div class="form-section">
            <h3>Boat Information</h3>
            <div class="input-group">
                <label for="wizardBoatName">Boat Name</label>
                <input type="text" id="wizardBoatName" placeholder="Enter boat name (optional)"
                       value="${((y=document.getElementById("boatName"))==null?void 0:y.value)||""}"
                       style="font-size: 18px; padding: 14px; width: 100%; border: 2px solid #ddd; border-radius: 8px;">
            </div>`,m&&(c+=`
            <div class="input-group">
                <label for="wizardBoatLength">Boat Length (feet) *</label>
                <input type="text" id="wizardBoatLength" placeholder="e.g., 35, 42, 50"
                       value="${((u=document.getElementById("boatLength"))==null?void 0:u.value)||"35"}"
                       style="font-size: 18px; padding: 14px; width: 100%; border: 2px solid #ddd; border-radius: 8px;">
            </div>`),c+=`
        </div>
    `,d?c+=`
            <div class="form-section">
                <h3>Hull Configuration</h3>

                <!-- Hull Type -->
                <div class="input-group">
                    <label>Number of Hulls</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="wizard_hull_type" value="monohull" checked>
                            <span>Monohull</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_hull_type" value="catamaran">
                            <span>Catamaran (2 hulls)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_hull_type" value="trimaran">
                            <span>Trimaran (3 hulls)</span>
                        </label>
                    </div>
                </div>
            </div>
        `:l&&(c+=`
            <div class="form-section">
                <h3>Boat Configuration</h3>

                <!-- Boat Type -->
                <div class="input-group">
                    <label>Boat Type</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="wizard_boat_type" value="sailboat" checked>
                            <span>Sailboat</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_boat_type" value="powerboat">
                            <span>Powerboat (+25% surcharge)</span>
                        </label>
                    </div>
                </div>

                <!-- Hull Type -->
                <div class="input-group">
                    <label>Hull Type</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="wizard_hull_type" value="monohull" checked>
                            <span>Monohull</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_hull_type" value="catamaran">
                            <span>Catamaran (+25% surcharge)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_hull_type" value="trimaran">
                            <span>Trimaran (+50% surcharge)</span>
                        </label>
                    </div>
                </div>

                <!-- Engine Configuration -->
                <div class="input-group">
                    <label>Engine Configuration</label>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" id="wizard_twin_engines" name="wizard_twin_engines">
                            <span>Twin engines (+10% surcharge)</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Current Condition</h3>

                <!-- Paint Condition -->
                <div class="input-group">
                    <label>Paint Condition</label>
                    <div class="option-button-group" id="wizardPaintConditionButtons">
                        <button type="button" class="option-button paint-excellent" data-value="excellent" onclick="selectWizardPaintCondition('excellent')">Excellent</button>
                        <button type="button" class="option-button paint-good selected" data-value="good" onclick="selectWizardPaintCondition('good')">Good</button>
                        <button type="button" class="option-button paint-fair" data-value="fair" onclick="selectWizardPaintCondition('fair')">Fair</button>
                        <button type="button" class="option-button paint-poor" data-value="poor" onclick="selectWizardPaintCondition('poor')">Poor</button>
                        <button type="button" class="option-button paint-missing" data-value="missing" onclick="selectWizardPaintCondition('missing')">Missing</button>
                    </div>
                    <input type="hidden" id="wizardPaintCondition" value="good">
                </div>

                <!-- Growth Level -->
                <div class="input-group">
                    <label>Growth Level</label>
                    <div class="growth-slider-container">
                        <input type="range" class="growth-slider" id="wizardGrowthLevelSlider" min="0" max="100" value="0" step="5">
                        <div class="growth-slider-labels">
                            <span style="font-size: 10px;">Min<br>0%</span>
                            <span style="font-size: 10px;">Light<br>0%</span>
                            <span style="font-size: 10px;">Mod<br>0%</span>
                            <span style="font-size: 10px;">Light+<br>25%</span>
                            <span style="font-size: 10px;">Mod+<br>50%</span>
                            <span style="font-size: 10px;">Heavy<br>75%</span>
                            <span style="font-size: 10px;">V.Heavy<br>100%</span>
                            <span style="font-size: 10px;">Severe<br>${b.SURCHARGES.SEVERE_GROWTH*100}%</span>
                            <span style="font-size: 10px;">Extreme<br>200%</span>
                        </div>
                        <div class="growth-slider-value" id="wizardGrowthSliderValue">Minimal (0%)</div>
                    </div>
                    <input type="hidden" id="wizardGrowthLevel" value="minimal">
                </div>
            </div>
        `),(l||r)&&(c+=`
            <div id="anodeSection" class="form-section" style="margin-top: 20px; background: #f8f9fa; border: 1px solid #dee2e6;">
                <h3 style="color: #2c3e50;">⚓ Select Zinc Anodes</h3>

            <div class="anode-selector">
                <div class="anode-categories" style="margin-top: 15px;">
                    <button type="button" class="category-btn active" onclick="if(window.adminApp) adminApp.filterByCategory('none')">None</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('all')">All</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('shaft')">Shaft</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('propeller')">Prop</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('hull')">Hull</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('collar')">Collar</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('engine')">Engine</button>
                    <button type="button" class="category-btn" onclick="if(window.adminApp) adminApp.filterByCategory('rudder')">Rudder</button>
                </div>

                <div class="wizard-field" id="anodeSearchField" style="margin-top: 15px;">
                    <input type="text" id="anodeSearch" class="search-input"
                           placeholder="Search by size or type..."
                           oninput="if(window.adminApp) adminApp.filterAnodes(this.value)">
                </div>

                <div id="materialFilter" class="material-filter" style="display: none; margin-top: 10px;">
                    <button type="button" class="material-btn active" onclick="if(window.adminApp) adminApp.filterByMaterial('all')">All</button>
                    <button type="button" class="material-btn" onclick="if(window.adminApp) adminApp.filterByMaterial('zinc')">Zinc</button>
                    <button type="button" class="material-btn" onclick="if(window.adminApp) adminApp.filterByMaterial('magnesium')">Mag</button>
                    <button type="button" class="material-btn" onclick="if(window.adminApp) adminApp.filterByMaterial('aluminum')">Alum</button>
                </div>

                <div id="stockFilter" class="stock-filter" style="display: none; margin-top: 10px;">
                    <button type="button" class="stock-btn active" onclick="if(window.adminApp) adminApp.filterByStock('all')">All Items</button>
                    <button type="button" class="stock-btn" onclick="if(window.adminApp) adminApp.filterByStock('in_stock')">In Stock Only</button>
                </div>

                <div id="shaftSubfilter" class="shaft-subfilter" style="display: none; margin-top: 10px;">
                    <button type="button" class="subfilter-btn active" onclick="if(window.adminApp) adminApp.filterShaftType('all')">All</button>
                    <button type="button" class="subfilter-btn" onclick="if(window.adminApp) adminApp.filterShaftType('standard')">Standard</button>
                    <button type="button" class="subfilter-btn" onclick="if(window.adminApp) adminApp.filterShaftType('metric')">Metric</button>
                </div>

                <div id="anodeGrid" class="anode-grid" style="display: none; max-height: 400px; overflow-y: auto; margin-top: 15px; border: 1px solid #ddd; border-radius: 8px; padding: 15px;">
                    <!-- Anodes will be populated here -->
                    <p style="color: #999;">Select a category above to view anodes</p>
                </div>
            </div>

            <div class="selected-anodes" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0;">Selected Anodes: <span id="selectedCount">0</span></h4>
                    <button type="button" onclick="if(window.adminApp) adminApp.clearSelectedAnodes()"
                            class="clear-anodes-btn"
                            style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                        Clear All
                    </button>
                </div>
                <div id="selectedAnodesList"></div>
            </div>

            <!-- Anode Conditions Section (shown when anodes selected) -->
            <div id="anodeConditionsSection" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                <h4 style="margin-bottom: 15px; color: #2c3e50;">Anode Conditions</h4>
                <div id="anodeConditionsList"></div>
            </div>
        </div>
    `),(l||r)&&(c+=`
            <div class="form-section">
                <h3>Additional Inspections</h3>

                <!-- Thru-Hull Condition -->
                <div class="input-group">
                    <label>Thru-Hull Condition</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="wizard_thru_hull" value="sound" checked>
                            <span>Sound - No issues observed</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_thru_hull" value="issues">
                            <span>Issues Observed</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wizard_thru_hull" value="not_inspected">
                            <span>Not Inspected</span>
                        </label>
                    </div>
                    <div id="thruHullNotesContainer" style="display: none; margin-top: 10px;">
                        <label>Issue Notes</label>
                        <textarea id="wizardThruHullNotes" rows="2"
                                  style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px;"
                                  placeholder="Describe observed issues..."></textarea>
                    </div>
                </div>

                <!-- Propeller Conditions -->
                <div class="input-group" style="margin-top: 20px;">
                    <label>Propeller Condition</label>
                    <div id="propellerConditionsContainer">
                        <!-- Propeller 1 -->
                        <div style="margin-bottom: 15px;">
                            <label style="font-size: 14px; font-weight: 500; margin-bottom: 5px; display: block;">
                                <span id="propLabel1">Propeller</span>
                            </label>
                            <select id="wizardPropeller1" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px;">
                                <option value="">Not Inspected</option>
                                <option value="excellent">Excellent - Like new</option>
                                <option value="good" selected>Good - Clean, no issues</option>
                                <option value="polished">Polished - Professionally polished</option>
                                <option value="fair">Fair - Minor dings/corrosion</option>
                                <option value="needs_service">Needs Service - Significant damage/growth</option>
                            </select>
                        </div>

                        <!-- Propeller 2 (shown for twin engines) -->
                        <div id="propeller2Container" style="display: none; margin-bottom: 15px;">
                            <label style="font-size: 14px; font-weight: 500; margin-bottom: 5px; display: block;">Propeller 2</label>
                            <select id="wizardPropeller2" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px;">
                                <option value="">Not Inspected</option>
                                <option value="excellent">Excellent - Like new</option>
                                <option value="good" selected>Good - Clean, no issues</option>
                                <option value="polished">Polished - Professionally polished</option>
                                <option value="fair">Fair - Minor dings/corrosion</option>
                                <option value="needs_service">Needs Service - Significant damage/growth</option>
                            </select>
                        </div>

                        <div>
                            <label style="font-size: 14px; font-weight: 500; margin-bottom: 5px; display: block;">Notes (optional)</label>
                            <textarea id="wizardPropellerNotes" rows="2"
                                      style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px;"
                                      placeholder="Any additional propeller observations..."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `),c+="</div>",n.innerHTML=c,n.className="consolidated-form-container active",!document.getElementById("consolidatedFormStyles")){const g=document.createElement("style");g.id="consolidatedFormStyles",g.textContent=`
            .consolidated-form {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            .form-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            .form-section h3 {
                margin-top: 0;
                margin-bottom: 20px;
                color: #2c3e50;
                font-size: 20px;
                font-weight: 600;
            }
            .form-section .input-group {
                margin-bottom: 20px;
            }
            .form-section .input-group:last-child {
                margin-bottom: 0;
            }
            .consolidated-form-container {
                padding: 20px 0;
            }
            .radio-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 10px;
            }
            .radio-option {
                display: flex;
                align-items: center;
                padding: 12px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .radio-option:hover {
                background: #f0f8ff;
                border-color: #3498db;
            }
            .radio-option input[type="radio"] {
                margin-right: 10px;
            }
            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 10px;
            }
            .checkbox-option {
                display: flex;
                align-items: center;
                padding: 12px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .checkbox-option:hover {
                background: #f0f8ff;
                border-color: #3498db;
            }
            .checkbox-option input[type="checkbox"] {
                margin-right: 10px;
            }
            .growth-slider-container {
                margin-top: 15px;
                padding: 20px;
                background: white;
                border-radius: 8px;
            }
            .growth-slider {
                width: 100%;
                margin: 20px 0;
            }
            .growth-slider-labels {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #666;
                margin-top: -10px;
            }
            .growth-slider-value {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                color: #2c3e50;
                margin-top: 15px;
            }
        `,document.head.appendChild(g)}setTimeout(()=>{if($e(),ze(),ke(),window.adminApp&&e&&(window.adminApp.currentServiceKey=e,console.log("Setting adminApp.currentServiceKey in renderConsolidatedForm to:",e),(e==="recurring_cleaning"||e==="onetime_cleaning"||e==="anodes_only")&&(console.log("Loading anode catalog for service:",e),window.adminApp.loadAnodeCatalog(),e==="anodes_only"))){const g=document.getElementById("anodeSection");g&&(g.style.display="block")}console.log("Initial calculation on wizard load"),window.calculateCost&&(window.calculateCost(),console.log("calculateCost called on wizard initialization")),window.updateWizardPricing&&(window.updateWizardPricing(),console.log("updateWizardPricing called on wizard initialization"))},100)};window.renderConsolidatedForm=_e;function ze(){const l=document.getElementById("wizardGrowthLevelSlider"),e=document.getElementById("wizardGrowthSliderValue"),t=document.getElementById("wizardGrowthLevel");l&&l.addEventListener("input",function(){const n=parseInt(this.value);let o,i,a;n<=10?(o="minimal",a=0):n<=20?(o="very-light",a=0):n<=30?(o="light",a=0):n<=40?(o="light-moderate",a=0):n<=50?(o="moderate",a=0):n<=55?(o="light-heavy",a=b.SURCHARGES.LIGHT_HEAVY_GROWTH*100):n<=62?(o="moderate-heavy",a=b.SURCHARGES.MODERATE_HEAVY_GROWTH*100):n<=70?(o="heavy",a=b.SURCHARGES.HEAVY_GROWTH*100):n<=80?(o="very-heavy",a=b.SURCHARGES.VERY_HEAVY_GROWTH*100):n<=90?(o="severe",a=b.SURCHARGES.SEVERE_GROWTH*100):(o="extreme",a=b.SURCHARGES.EXTREME_GROWTH*100),i=a+"%";const s=o.split("-").map(d=>d.charAt(0).toUpperCase()+d.slice(1)).join(" ");e.textContent=`${s} (${i})`,t.value=o,t.setAttribute("data-surcharge",a/100);const r=document.getElementById("growth_level");r&&(r.value=o),window.calculateCost&&window.calculateCost(),window.updateChargeSummary&&window.updateChargeSummary(),window.updateWizardPricing&&window.updateWizardPricing()})}function ke(){const l=document.getElementById("wizard_twin_engines"),e=document.getElementById("propeller2Container"),t=document.getElementById("propLabel1");if(l&&e){const i=()=>{l.checked?(e.style.display="block",t&&(t.textContent="Propeller 1")):(e.style.display="none",t&&(t.textContent="Propeller"))};l.addEventListener("change",i),i()}const n=document.querySelectorAll('input[name="wizard_thru_hull"]'),o=document.getElementById("thruHullNotesContainer");n.length>0&&o&&n.forEach(i=>{i.addEventListener("change",function(){this.value==="issues"?o.style.display="block":o.style.display="none"})})}window.updateAnodeConditions=function(){const l=document.getElementById("anodeConditionsSection"),e=document.getElementById("anodeConditionsList");if(!l||!e||!window.adminApp||!window.adminApp.selectedAnodes)return;const t=window.adminApp.selectedAnodes,n={};if(Object.values(t).forEach(a=>{let s="other";const r=(a.category||"").toLowerCase(),d=(a.name||"").toLowerCase();r.includes("shaft")||d.includes("shaft")?s="shaft":r.includes("propeller")||r.includes("prop")||d.includes("prop")?s="propeller":r.includes("hull")?s="hull":(r.includes("engine")||r.includes("outboard"))&&(s="engine"),n[s]||(n[s]=[]),n[s].push(a)}),Object.keys(n).length===0){l.style.display="none";return}let o="";const i={shaft:"Shaft Anode",propeller:"Propeller Anode",hull:"Hull Anode",engine:"Engine Anode",other:"Other Anode"};Object.keys(n).sort().forEach(a=>{const r=n[a].reduce((d,c)=>d+(c.quantity||0),0);o+=`
            <div style="margin-bottom: 15px;">
                <label style="font-size: 14px; font-weight: 500; margin-bottom: 5px; display: block;">
                    ${i[a]||a} (${r} installed)
                </label>
                <select id="anodeCondition_${a}" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px;">
                    <option value="excellent">Excellent (90-100%)</option>
                    <option value="good" selected>Good (60-90%)</option>
                    <option value="fair">Fair (30-60%)</option>
                    <option value="poor">Poor (0-30%)</option>
                    <option value="missing">Missing/Dissolved</option>
                </select>
            </div>
        `}),e.innerHTML=o,l.style.display="block"};function $e(){const l=document.getElementById("wizardBoatName");l&&l.addEventListener("input",function(){const s=document.getElementById("boatName");s&&(s.value=this.value)});const e=document.getElementById("wizardBoatLength");if(e){const s=document.getElementById("boatLength");s&&s.value&&(e.value=s.value),e.addEventListener("input",function(){const r=document.getElementById("boatLength");r&&(r.value=this.value,console.log("Boat length synced to:",this.value),window.calculateCost&&(window.calculateCost(),console.log("calculateCost called after boat length change")),window.updateChargeSummary&&window.updateChargeSummary(),window.updateWizardPricing&&(window.updateWizardPricing(),console.log("updateWizardPricing called after boat length change")))})}else{const s=document.getElementById("boatLength");s&&(s.value="0")}document.querySelectorAll('input[name="wizard_boat_type"]').forEach(s=>{s.addEventListener("change",function(){const r=document.querySelector(`input[name="boat_type"][value="${this.value}"]`);r&&(r.checked=!0,window.calculateCost&&window.calculateCost(),window.updateChargeSummary&&window.updateChargeSummary(),window.updateWizardPricing&&window.updateWizardPricing())})}),document.querySelectorAll('input[name="wizard_hull_type"]').forEach(s=>{s.addEventListener("change",function(){const r=document.querySelector(`input[name="hull_type"][value="${this.value}"]`);r&&(r.checked=!0,window.calculateCost&&window.calculateCost(),window.updateChargeSummary&&window.updateChargeSummary(),window.updateWizardPricing&&window.updateWizardPricing())})});const o=document.getElementById("wizard_twin_engines");o&&o.addEventListener("change",function(){const s=document.getElementById("has_twin_engines");s&&(s.checked=this.checked,window.calculateCost&&window.calculateCost(),window.updateChargeSummary&&window.updateChargeSummary(),window.updateWizardPricing&&window.updateWizardPricing())});const i=document.getElementById("wizardPaintCondition");if(i){const s=document.getElementById("paint_condition");s&&(s.value=i.value),new MutationObserver(function(){s&&(s.value=i.value)}).observe(i,{attributes:!0,attributeFilter:["value"]})}const a=document.getElementById("wizardGrowthLevel");if(a){const s=document.getElementById("growth_level");s&&(s.value=a.value),new MutationObserver(function(){s&&(s.value=a.value)}).observe(a,{attributes:!0,attributeFilter:["value"]})}}window.backToServices=function(){const l=document.querySelector(".service-selector"),e=l?l.querySelector("h2"):null,t=document.getElementById("wizardContainer"),n=document.getElementById("simpleServiceButtons");t.style.display="none",t.innerHTML="",n&&(n.style.display="flex"),e&&(e.style.display="block"),window.currentServiceKey=null,window.selectedServiceKey=null};window.toggleAnodeSection=function(){const l=document.getElementById("anodeSection");l&&(l.style.display==="none"||!l.style.display?(l.style.display="block",l.scrollIntoView({behavior:"smooth"})):l.style.display="none")};window.updateWizardPricing=function(){var l,e,t,n,o,i,a,s,r,d,c,m,y,u,g,h,w,v,I,L,$;if(window.updateWizardPricing.isRunning){console.log("updateWizardPricing already running, skipping to prevent infinite loop");return}window.updateWizardPricing.isRunning=!0;try{console.log("updateWizardPricing called");const B=window.currentServiceKey||window.selectedServiceKey;if(!B){console.log("No service selected");return}const k=window.serviceData[B];if(!k){console.log("Service not found:",B);return}const M=parseFloat((l=document.getElementById("boatLength"))==null?void 0:l.value)||0,q=k.type==="per_foot";let P=q?k.rate*M:k.rate,A=[],R=0;if(q&&M>0?A.push(`Base rate: $${k.rate}/ft × ${M}ft = $${P.toFixed(2)}`):q||A.push(`Flat rate: $${P.toFixed(2)}`),B==="recurring_cleaning"||B==="onetime_cleaning"){if((((e=document.querySelector('input[name="wizard_boat_type"]:checked'))==null?void 0:e.value)||((t=document.querySelector('input[name="boat_type"]:checked'))==null?void 0:t.value)||"sailboat")==="powerboat"){const E=P*b.SURCHARGES.POWERBOAT;R+=E,A.push(`Powerboat surcharge (${b.SURCHARGES.POWERBOAT*100}%): +$${E.toFixed(2)}`)}const C=((n=document.querySelector('input[name="wizard_hull_type"]:checked'))==null?void 0:n.value)||((o=document.querySelector('input[name="hull_type"]:checked'))==null?void 0:o.value)||"monohull";if(C==="catamaran"){const E=P*b.SURCHARGES.CATAMARAN;R+=E,A.push(`Catamaran surcharge (${b.SURCHARGES.CATAMARAN*100}%): +$${E.toFixed(2)}`)}else if(C==="trimaran"){const E=P*b.SURCHARGES.TRIMARAN;R+=E,A.push(`Trimaran surcharge (${b.SURCHARGES.TRIMARAN*100}%): +$${E.toFixed(2)}`)}if(((i=document.getElementById("wizard_twin_engines"))==null?void 0:i.checked)||((a=document.getElementById("has_twin_engines"))==null?void 0:a.checked)){const E=P*.1;R+=E,A.push(`Twin engines surcharge (10%): +$${E.toFixed(2)}`)}const O=((s=document.getElementById("wizardPaintCondition"))==null?void 0:s.value)||((r=document.getElementById("paint_condition"))==null?void 0:r.value)||"good",W={excellent:0,good:0,fair:0,poor:.1,missing:.15}[O]||0;if(W>0){const E=P*W;R+=E;const H=(W*100).toFixed(0);A.push(`Paint condition (${O}) surcharge (${H}%): +$${E.toFixed(2)}`)}const T=document.getElementById("wizardGrowthLevel")||document.getElementById("growth_level"),N=(T==null?void 0:T.value)||"minimal";let z;if(T&&T.hasAttribute("data-surcharge")?z=parseFloat(T.getAttribute("data-surcharge"))||0:z={minimal:0,"very-light":0,light:0,"light-moderate":0,moderate:0,"light-heavy":b.SURCHARGES.LIGHT_HEAVY_GROWTH,"moderate-heavy":b.SURCHARGES.MODERATE_HEAVY_GROWTH,heavy:b.SURCHARGES.HEAVY_GROWTH,"very-heavy":b.SURCHARGES.VERY_HEAVY_GROWTH,severe:b.SURCHARGES.SEVERE_GROWTH,extreme:b.SURCHARGES.EXTREME_GROWTH}[N]||0,z>0){const E=P*z;R+=E;const H=(z*100).toFixed(0);A.push(`Growth level (${N}) surcharge (${H}%): +$${E.toFixed(2)}`)}}if(R>0&&P>0){const p=(R/P*100).toFixed(0);A.push(`<strong>Total surcharges (${p}%): +$${R.toFixed(2)}</strong>`)}let Z=P+R;const G=b.MINIMUM_SERVICE_FEE;let _=Math.max(Z,G);_===G&&Z<G&&A.push(`Minimum charge applied: $${G}`);const J=document.getElementById("chargeSummaryContent");if(J){let p='<div class="charge-breakdown">';window.selectedCustomer&&(p+=`
                <div class="charge-detail-row">
                    <span><strong>Customer:</strong></span>
                    <span>${window.selectedCustomer.name||window.selectedCustomer.email}</span>
                </div>`),p+=`
            <div class="charge-detail-row">
                <span><strong>Service:</strong></span>
                <span>${k.name}</span>
            </div>`,p+='<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">',p+='<h4 style="margin: 0 0 10px 0; color: #2c3e50;">Boat Details</h4>';const C=((d=document.getElementById("boatName"))==null?void 0:d.value)||((c=document.getElementById("wizardBoatName"))==null?void 0:c.value);C&&(p+=`
                <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                    <span>Boat Name:</span>
                    <span>${C}</span>
                </div>`),M>0&&(p+=`
                <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                    <span>Boat Length:</span>
                    <span>${M} feet</span>
                </div>`);const F=((m=document.querySelector('input[name="wizard_boat_type"]:checked'))==null?void 0:m.value)||((y=document.querySelector('input[name="boat_type"]:checked'))==null?void 0:y.value)||"sailboat";p+=`
            <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                <span>Boat Type:</span>
                <span>${F==="powerboat"?"Powerboat":"Sailboat"}</span>
            </div>`;const O=((u=document.querySelector('input[name="wizard_hull_type"]:checked'))==null?void 0:u.value)||((g=document.querySelector('input[name="hull_type"]:checked'))==null?void 0:g.value)||"monohull";if(p+=`
            <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                <span>Hull Type:</span>
                <span>${O==="catamaran"?"Catamaran":O==="trimaran"?"Trimaran":"Monohull"}</span>
            </div>`,(((h=document.getElementById("wizard_twin_engines"))==null?void 0:h.checked)||((w=document.getElementById("has_twin_engines"))==null?void 0:w.checked))&&(p+=`
                <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                    <span>Twin Engines:</span>
                    <span>Yes</span>
                </div>`),B==="recurring_cleaning"||B==="onetime_cleaning"){const S=((v=document.getElementById("wizardPaintCondition"))==null?void 0:v.value)||((I=document.getElementById("paint_condition"))==null?void 0:I.value)||"good";p+=`
                <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                    <span>Paint Condition:</span>
                    <span>${S.charAt(0).toUpperCase()+S.slice(1)}</span>
                </div>`;const Q=(((L=document.getElementById("wizardGrowthLevel"))==null?void 0:L.value)||(($=document.getElementById("growth_level"))==null?void 0:$.value)||"minimal").split("-").map(ge=>ge.charAt(0).toUpperCase()+ge.slice(1)).join(" ");p+=`
                <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                    <span>Growth Level:</span>
                    <span>${Q}</span>
                </div>`}let T=0,N=0;if(window.adminApp&&window.adminApp.selectedAnodes&&Object.keys(window.adminApp.selectedAnodes).length>0){const S=window.adminApp.getSelectedAnodes();S&&S.count>0&&(p+='<div style="margin-top: 10px;">',p+='<h5 style="margin: 10px 0 5px 0; color: #2c3e50;">Anodes Selected</h5>',S.items.forEach(D=>{p+=`
                        <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">
                            <span>${D.quantity}x ${D.name}</span>
                            <span>$${D.subtotal.toFixed(2)}</span>
                        </div>`}),T=S.totalPrice,N=S.count*15,p+=`
                    <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0; padding-top: 5px; border-top: 1px solid #eee;">
                        <span>Anode Installation Labor (${S.count} × $15)</span>
                        <span>$${N.toFixed(2)}</span>
                    </div>`,p+=`
                    <div class="charge-detail-row" style="font-size: 14px; margin: 5px 0; font-weight: 600;">
                        <span>Anodes Subtotal</span>
                        <span>$${(T+N).toFixed(2)}</span>
                    </div>`,p+="</div>",A.push(`Anodes: $${T.toFixed(2)}`),A.push(`Anode Installation Labor: $${N.toFixed(2)}`),_+=T+N)}p+="</div>",p+='<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">',p+='<h4 style="margin: 0 0 10px 0; color: #2c3e50;">Pricing Breakdown</h4>',p+=A.map(S=>`<div class="charge-detail-row" style="font-size: 14px; margin: 5px 0;">${S}</div>`).join(""),p+="</div>";let z=_;if(window.adminApp&&window.adminApp.priceAdjustment){const S=window.adminApp.priceAdjustment;if(S.type==="percent")z=_*(1-S.value/100),p+=`
                    <div class="charge-detail-row" style="font-size: 14px; color: #e67e22; margin: 10px 0;">
                        <span>Discount (${S.value}%):</span>
                        <span>-$${(_-z).toFixed(2)}</span>
                    </div>`;else if(S.type==="dollar")z=Math.max(0,_-S.value),p+=`
                    <div class="charge-detail-row" style="font-size: 14px; color: #e67e22; margin: 10px 0;">
                        <span>Discount:</span>
                        <span>-$${S.value.toFixed(2)}</span>
                    </div>`;else if(S.type==="custom"){z=S.value;const D=_-z;D>0?p+=`
                        <div class="charge-detail-row" style="font-size: 14px; color: #e67e22; margin: 10px 0;">
                            <span>Adjustment:</span>
                            <span>-$${D.toFixed(2)}</span>
                        </div>`:D<0&&(p+=`
                        <div class="charge-detail-row" style="font-size: 14px; color: #27ae60; margin: 10px 0;">
                            <span>Adjustment:</span>
                            <span>+$${Math.abs(D).toFixed(2)}</span>
                        </div>`)}}window.adminApp&&(window.adminApp.finalPrice=z),p+=`
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #3498db;">
                <div class="charge-detail-row" style="font-size: 20px; font-weight: bold;">
                    <span>Total:</span>
                    <span style="color: #27ae60; display: flex; align-items: center; gap: 10px;">
                        $${z.toFixed(2)}
                        <button onclick="window.adminApp.openPriceCustomization(${_})"
                            style="padding: 2px 8px; font-size: 11px; background: #7f8c8d; color: white; border: none; border-radius: 3px; cursor: pointer;"
                            title="Customize price">
                            ✏️
                        </button>
                    </span>
                </div>
            </div>`,p+="</div>",J.innerHTML=p;const E=document.querySelector(".charge-summary");E&&(E.style.display="block");const H=document.getElementById("chargeButton");H&&(H.disabled=!1)}const X=document.getElementById("totalCost");X&&(X.value=_.toFixed(2),console.log("Updated totalCost hidden input to:",_.toFixed(2)));const ee=document.getElementById("totalCostDisplay");ee&&(ee.value=_.toFixed(2)),window.adminApp&&typeof window.adminApp.updateChargeSummary=="function"&&(window.adminApp.updateChargeSummary(),console.log("Called adminApp.updateChargeSummary after setting price"));const te=document.getElementById("priceBreakdown");te&&(te.innerHTML=`
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                ${A.join("<br>")}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #dee2e6;">
                    <strong style="font-size: 18px;">Total: $${_.toFixed(2)}</strong>
                </div>
            </div>
        `);const ne=document.getElementById("editableAmount");ne&&(ne.value=_.toFixed(2));const oe=document.getElementById("totalCostDisplay");oe&&(oe.textContent=`$${_.toFixed(2)}`);const Y=document.getElementById("totalCost");Y&&(Y.textContent=`$${_.toFixed(2)}`,Y.value=_.toFixed(2)),window.adminApp&&B&&(window.adminApp.currentServiceKey=B,console.log("Setting adminApp.currentServiceKey to:",B),typeof window.adminApp.updateChargeSummary=="function"&&window.adminApp.updateChargeSummary());const f=document.getElementById("pricingChargeButton");f&&(f.disabled=!1);const x=document.getElementById("chargeButton");x&&(x.disabled=!1)}finally{window.updateWizardPricing.isRunning=!1}};const Pe=function(l){const e=["Minimal Growth","Moderate Growth","Heavy Growth","Severe Growth"],t=document.getElementById("growthDisplay");t&&(t.textContent=e[parseInt(l)])};window.updateGrowthDisplay=Pe;const Te=function(l){l==="next"?window.wizardCurrentStep<window.wizardSteps.length-1&&(window.wizardCurrentStep++,de()):l==="prev"&&window.wizardCurrentStep>0&&(window.wizardCurrentStep--,de())};window.navigateWizard=Te;const de=function(){document.querySelectorAll(".wizard-step").forEach((o,i)=>{i===window.wizardCurrentStep?(o.classList.add("active"),o.style.display="block"):(o.classList.remove("active"),o.style.display="none")}),document.querySelectorAll(".step-indicator").forEach((o,i)=>{i===window.wizardCurrentStep?o.classList.add("active"):o.classList.remove("active")});const t=document.getElementById("wizardPrev"),n=document.getElementById("wizardNext");t&&(t.style.display=window.wizardCurrentStep===0?"none":"inline-block"),n&&(n.textContent=window.wizardCurrentStep===window.wizardSteps.length-1?"Finish":"Next")};window.updateWizardDisplay=de;window.updatePricing=function(){console.log("updatePricing called - calculating price based on current inputs"),window.updateChargeSummary&&typeof window.updateChargeSummary=="function"&&window.updateChargeSummary()};let re=null,j=[];window.searchCustomerByName=async function(l){re&&clearTimeout(re);const e=document.getElementById("customerSearchResults");if(!l||l.length<2){e.style.display="none",j=[];return}re=setTimeout(async()=>{try{const n=await(await fetch(`${we}/stripe-customers?search=${encodeURIComponent(l)}`)).json();n&&n.length>0?(j=n,e.innerHTML=n.map(o=>`
                    <div onclick="window.selectWizardCustomer('${o.id}')"
                         style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;"
                         onmouseover="this.style.backgroundColor='#f0f0f0'"
                         onmouseout="this.style.backgroundColor='white'">
                        <div style="font-weight: 500;">${o.name||"Unnamed"}</div>
                        <div style="font-size: 12px; color: #666;">${o.email}</div>
                        ${o.boat_name?`<div style="font-size: 12px; color: #666;">Boat: ${o.boat_name}</div>`:""}
                    </div>
                `).join(""),e.style.display="block"):(j=[],e.innerHTML='<div style="padding: 10px; color: #666;">No customers found</div>',e.style.display="block")}catch(t){console.error("Error searching customers:",t),e.style.display="none",j=[]}},300)};window.selectWizardCustomer=async function(l){try{const t=await(await fetch(`${we}/stripe-customers?customerId=${l}`)).json();if(t){document.getElementById("wizardCustomerName").value=t.name||"",document.getElementById("wizardCustomerEmail").value=t.email||"",document.getElementById("wizardCustomerPhone").value=t.phone||"",document.getElementById("customerSearchResults").style.display="none",window.selectedWizardCustomer=t;const n=document.getElementById("wizardPaymentInfo"),o=document.getElementById("wizardPaymentDetails");if(t.payment_methods&&t.payment_methods.length>0){const i=t.payment_methods[0],a=i.card.brand.charAt(0).toUpperCase()+i.card.brand.slice(1),s=i.card.last4,r=String(i.card.exp_month).padStart(2,"0"),d=String(i.card.exp_year).slice(-2);o.textContent=`${a} •••• ${s} (exp ${r}/${d})`,n.style.display="block",window.selectedWizardPaymentMethodId=i.id}else n.style.display="none",window.selectedWizardPaymentMethodId=null;if(t.boat_length){const i=document.getElementById("wizardBoatLength")||document.getElementById("boat_length");i&&(i.value=t.boat_length)}if(t.boat_name){const i=document.getElementById("wizardBoatName")||document.getElementById("boat_name");i&&(i.value=t.boat_name)}if(t.boat_make){const i=document.getElementById("wizardBoatMake")||document.getElementById("boat_make");i&&(i.value=t.boat_make)}if(t.boat_model){const i=document.getElementById("wizardBoatModel")||document.getElementById("boat_model");i&&(i.value=t.boat_model)}window.calculateCost&&window.calculateCost(),window.updateChargeSummary&&window.updateChargeSummary()}}catch(e){console.error("Error fetching customer details:",e)}};document.addEventListener("click",function(l){const e=document.getElementById("customerSearchResults"),t=document.getElementById("wizardCustomerName");e&&t&&!t.contains(l.target)&&!e.contains(l.target)&&(e.style.display="none")});document.addEventListener("keydown",function(l){const e=document.getElementById("wizardCustomerName");l.target===e&&l.key==="Enter"&&(l.preventDefault(),j&&j.length>0&&window.selectWizardCustomer(j[0].id))});var he;const Le=((he=window.ENV)==null?void 0:he.VITE_STRIPE_PUBLISHABLE_KEY)||"pk_live_pri1IepedMvGQmLCFrV4kVzF",ve=Stripe(Le);let ce=null,V=null;const se=me();async function be(){var I,L,$,B,k,M,q,P,A,R,Z,G,_,J,X,ee,te,ne,oe,Y;if(window.adminApp&&window.adminApp.chargeCustomer)return window.adminApp.chargeCustomer();const l=window.currentServiceKey;if(!l){alert("Please select a service first");return}if(!window.selectedCustomer){window.adminApp&&window.adminApp.openCustomerModal?window.adminApp.openCustomerModal():xe();return}const e=document.getElementById("paymentMethodSelect"),t=e?e.value:"stripe";if(t==="stripe"&&!window.selectedCustomer.payment_method){alert("Please add a payment method for this customer or select a different payment option");return}const n=document.getElementById("chargeButton"),o=n.innerHTML;n.innerHTML='Processing... <span class="loading-spinner"></span>',n.classList.add("processing"),n.disabled=!0;const i=document.getElementById("editableAmount");let a;if(i)a=parseFloat(i.value)||0;else{const f=document.getElementById("totalCostDisplay"),x=f?parseFloat(f.textContent.replace("$","").replace(",","")):0;let p=0;const C=Object.values(window.anodeCart||{});if(C.length>0){const F=parseFloat(((I=document.getElementById("taxRate"))==null?void 0:I.value)||10.75)/100,O=parseFloat(((L=document.getElementById("markupRate"))==null?void 0:L.value)||20)/100,ae=parseFloat((($=document.getElementById("laborCharge"))==null?void 0:$.value)||15),W=C.reduce((D,Q)=>D+Q.list_price*Q.quantity,0),N=C.reduce((D,Q)=>D+Q.quantity,0)*ae,z=W+N,E=z*O,H=z+E,S=H*F;p=H+S}a=x+p}const s=document.querySelector(".service-option.selected"),r=s?s.dataset.serviceKey:"",d=s?s.querySelector(".service-title"):null,c=d?d.textContent:"",m=((B=document.getElementById("boatLength"))==null?void 0:B.value)||"0",y=((k=document.getElementById("boatName"))==null?void 0:k.value)||"",u={service_key:r||l,service_name:c,service_date:new Date().toISOString().split("T")[0],service_time:new Date().toLocaleTimeString()};y&&(u.boat_name=y),window.selectedCustomer&&window.selectedCustomer.boat_name&&!y&&(u.boat_name=window.selectedCustomer.boat_name);const g=l==="onetime_cleaning"||l==="recurring_cleaning",h=l==="item_recovery"||l==="underwater_inspection";if(g){u.boat_length=m,u.last_paint=(M=document.getElementById("lastPaintedTime"))==null?void 0:M.value,u.last_cleaned=(q=document.getElementById("lastCleanedTime"))==null?void 0:q.value;const f=(P=document.querySelector('input[name="hull_type"]:checked'))==null?void 0:P.value;f&&(u.hull_type=f,f==="catamaran"&&(u.additional_hulls=1),f==="trimaran"&&(u.additional_hulls=2)),((A=document.getElementById("has_twin_engines"))==null?void 0:A.checked)?(u.twin_engines=!0,u.engine_type="twin"):u.engine_type="single";const p=(R=document.querySelector('input[name="boat_type"]:checked'))==null?void 0:R.value;p&&(u.boat_type=p);const C=((Z=document.getElementById("actualPaintCondition"))==null?void 0:Z.value)||((G=document.getElementById("wizardPaintCondition"))==null?void 0:G.value);C&&(u.paint_condition=C);const F=((_=document.getElementById("actualGrowthLevel"))==null?void 0:_.value)||((J=document.getElementById("wizardGrowthLevel"))==null?void 0:J.value);F&&(u.growth_level=F);const O=[];document.querySelectorAll('[id^="anodeCondition_"]').forEach(H=>{const S=H.id.replace("anodeCondition_","");H.value&&O.push({type:S,condition:H.value})}),O.length>0&&(u.anode_conditions=O);const W=(X=document.querySelector('input[name="wizard_thru_hull"]:checked'))==null?void 0:X.value;W&&(u.thru_hull_condition=W);const T=(ee=document.getElementById("wizardThruHullNotes"))==null?void 0:ee.value;T&&(u.thru_hull_notes=T);const N=(te=document.getElementById("wizardPropeller1"))==null?void 0:te.value;N&&(u.propeller_1_condition=N);const z=(ne=document.getElementById("wizardPropeller2"))==null?void 0:ne.value;z&&(u.propeller_2_condition=z);const E=(oe=document.getElementById("wizardPropellerNotes"))==null?void 0:oe.value;E&&(u.propeller_notes=E)}const w=Object.values(window.anodeCart||{});if(w.length>0){const f=w.reduce((x,p)=>x+p.quantity,0);u.anodes_included=!0,u.anode_count=f,u.anode_details=w.map(x=>({id:x.id,name:x.name,quantity:x.quantity,unit_price:x.list_price}))}let v=c||l.replace(/_/g," ");if(w.length>0){const f=w.reduce((x,p)=>x+p.quantity,0);v+=` + ${f} Anode${f!==1?"s":""}`}y&&(v=`${v} - ${y}`),!h&&m&&(v+=` (${m}ft)`),v+=` - ${new Date().toLocaleDateString()}`;try{console.log("Logging service conditions to Portal...");const f={boat_id:((Y=window.selectedBoat)==null?void 0:Y.id)||null,service_date:new Date().toISOString().split("T")[0],order_id:null,paint_condition_overall:u.paint_condition||null,growth_level:u.growth_level||null,anode_conditions:u.anode_conditions||[],thru_hull_condition:u.thru_hull_condition||null,thru_hull_notes:u.thru_hull_notes||null,propeller_1_condition:u.propeller_1_condition||null,propeller_2_condition:u.propeller_2_condition||null,propeller_notes:u.propeller_notes||null,service_type:u.service_name||c,time_in:null,time_out:null,notes:`Service: ${c}${u.boat_name?" - "+u.boat_name:""}`,photos:[]};if(f.boat_id&&(f.paint_condition_overall||f.growth_level||f.anode_conditions.length>0||f.thru_hull_condition||f.propeller_1_condition)){const x=await fetch("https://sailorskills-portal.vercel.app/api/service-complete",{method:"POST",headers:{"Content-Type":"application/json","X-Source":"billing"},body:JSON.stringify(f)});if(!x.ok)console.error("Portal logging failed:",await x.text());else{const p=await x.json();console.log("✅ Conditions logged to Portal:",p.condition_id)}}else console.log("Skipping Portal log - no boat_id or condition data")}catch(f){console.error("Error logging to Portal:",f)}if(t==="stripe")try{const x=await(await fetch(`${se}/charge-customer`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerId:window.selectedCustomer.id,amount:Math.round(a*100),description:v,metadata:u})})).json();if(x.success){if(w.length>0){console.log("Consuming inventory for",w.length,"anodes");for(const p of w)if(p.inventory_id)try{const{data:C,error:F}=await window.supabase.rpc("consume_inventory",{p_inventory_id:p.inventory_id,p_quantity:p.quantity,p_reference_id:x.paymentIntent.id,p_notes:`Customer: ${window.selectedCustomer.name||window.selectedCustomer.email} - ${c}${u.boat_name?" - "+u.boat_name:""}`});F||!(C!=null&&C.success)?console.error("Failed to consume inventory for",p.name,":",F||C):console.log("✅ Consumed",p.quantity,"x",p.name,"from inventory")}catch(C){console.error("Error consuming inventory:",C)}else console.warn("Anode missing inventory_id:",p.name)}K("success",`✅ Successfully charged $${a.toFixed(2)} to ${window.selectedCustomer.name||window.selectedCustomer.email}<br>
                 Payment ID: ${x.paymentIntent.id}`),setTimeout(()=>{window.selectedCustomer=null,document.getElementById("selectedCustomer").classList.remove("active"),document.querySelectorAll(".customer-item").forEach(p=>{p.classList.remove("selected")}),updateChargeSummary()},3e3)}else K("error",`❌ Payment failed: ${x.error}`)}catch(f){K("error",`❌ Error processing payment: ${f.message}`)}else try{const f=await Be(t,a,v,u);if(f.success){if(w.length>0){console.log("Consuming inventory for",w.length,"anodes");for(const p of w)if(p.inventory_id)try{const{data:C,error:F}=await window.supabase.rpc("consume_inventory",{p_inventory_id:p.inventory_id,p_quantity:p.quantity,p_reference_id:f.invoiceNumber,p_notes:`Customer: ${window.selectedCustomer.name||window.selectedCustomer.email} - ${c}${u.boat_name?" - "+u.boat_name:""} [${t.toUpperCase()}]`});F||!(C!=null&&C.success)?console.error("Failed to consume inventory for",p.name,":",F||C):console.log("✅ Consumed",p.quantity,"x",p.name,"from inventory")}catch(C){console.error("Error consuming inventory:",C)}else console.warn("Anode missing inventory_id:",p.name)}const x={zoho:"External Payment (Zoho)",cash:"Cash Payment",check:"Check Payment",pending:"Payment Pending"}[t];K("success",`✅ Successfully recorded ${x} of $${a.toFixed(2)} for ${window.selectedCustomer.name||window.selectedCustomer.email}<br>
                     Invoice #: ${f.invoiceNumber}`),setTimeout(()=>{window.selectedCustomer=null,document.getElementById("selectedCustomer").classList.remove("active"),document.querySelectorAll(".customer-item").forEach(p=>{p.classList.remove("selected")}),updateChargeSummary()},3e3)}else K("error",`❌ Failed to record payment: ${f.error}`)}catch(f){K("error",`❌ Error recording payment: ${f.message}`)}n.innerHTML=o,n.classList.remove("processing"),n.disabled=!1,updateChargeSummary()}function Me(){var t;const l=parseFloat(((t=document.getElementById("editableAmount"))==null?void 0:t.value)||0),e=document.getElementById("chargeButton");window.selectedCustomer&&window.selectedCustomer.payment_method&&(e.disabled=l===0,e.textContent=`Charge $${l.toFixed(2)}`)}function K(l,e){const t=document.getElementById("chargeResult");t&&(t.className=`charge-result ${l}`,t.innerHTML=e,t.style.display="block",setTimeout(()=>{t.style.display="none"},5e3))}async function Ce(l){const e=window.customers.find(n=>n.id===l);if(!e){alert("Customer not found");return}window.currentPaymentCustomer=e;const t=document.getElementById("paymentCustomerInfo");t&&(t.innerHTML=`
            <strong>Customer:</strong> ${e.name||"Unnamed"}<br>
            <strong>Email:</strong> ${e.email}
        `),ce=ve.elements(),V=ce.create("card",{style:{base:{fontSize:"16px",color:"#32325d",fontFamily:'"Helvetica Neue", Helvetica, sans-serif',"::placeholder":{color:"#aab7c4"}},invalid:{color:"#fa755a",iconColor:"#fa755a"}}}),V.mount("#card-element"),V.on("change",function(n){const o=document.getElementById("card-errors");n.error?o.textContent=n.error.message:o.textContent=""}),document.getElementById("paymentMethodModal").style.display="block"}function Ee(){const l=document.getElementById("paymentMethodModal");l&&(l.style.display="none"),V&&(V.destroy(),V=null),ce=null,window.currentPaymentCustomer=null}document.addEventListener("DOMContentLoaded",function(){const l=document.getElementById("payment-form");l&&l.addEventListener("submit",async function(e){if(e.preventDefault(),!window.currentPaymentCustomer){alert("No customer selected");return}const t=document.getElementById("submit-payment");t.disabled=!0,t.textContent="Adding...";try{const o=await(await fetch(`${se}/create-setup-intent`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerId:window.currentPaymentCustomer.stripe_customer_id})})).json();if(!o.clientSecret)throw new Error("Failed to create setup intent");const i=await ve.confirmCardSetup(o.clientSecret,{payment_method:{card:V,billing_details:{name:window.currentPaymentCustomer.name,email:window.currentPaymentCustomer.email}}});if(i.error)throw new Error(i.error.message);const s=await(await fetch(`${se}/save-payment-method`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerId:window.currentPaymentCustomer.id,paymentMethodId:i.setupIntent.payment_method})})).json();if(s.success)alert("Payment method added successfully!"),Ee(),typeof loadRecentCustomers=="function"&&loadRecentCustomers();else throw new Error(s.error||"Failed to save payment method")}catch(n){alert("Error adding payment method: "+n.message),console.error("Payment method error:",n)}finally{t.disabled=!1,t.textContent="Add Card"}})});function xe(){const l=document.getElementById("customerSelectionModal");if(l){l.style.display="block";const e=document.getElementById("modalCustomerList");e&&window.customers&&(e.innerHTML=window.customers.map(t=>`
                <div class="customer-item" onclick="selectModalCustomer('${t.id}')" style="padding: 10px; border: 1px solid #ddd; margin-bottom: 5px; cursor: pointer; border-radius: 5px;">
                    <div style="font-weight: bold;">${t.name||"Unnamed Customer"}</div>
                    <div style="font-size: 14px; color: #666;">${t.email}${t.boat_name?" • Boat: "+t.boat_name:""}</div>
                    <div style="font-size: 12px; color: ${t.payment_method?"green":"orange"};">
                        ${t.payment_method?"✓ Card on file":"⚠ No card on file"}
                    </div>
                </div>
            `).join(""))}}function Se(){const l=document.getElementById("customerSelectionModal");l&&(l.style.display="none")}let ue=null;function Re(l){ue=l,document.querySelectorAll("#modalCustomerList .customer-item").forEach(e=>{e.style.background="white"}),event.currentTarget.style.background="#e3f2fd"}async function Fe(){if(!ue){alert("Please select a customer");return}const l=window.customers.find(e=>e.id===ue);if(l){window.selectedCustomer=l;const e=document.getElementById("selectedCustomer"),t=document.getElementById("selectedCustomerInfo");e&&t&&(t.innerHTML=`${l.name||"Unnamed"} - ${l.email}
                ${l.payment_method?'<span style="color: green;">✓ Card on file</span>':'<span style="color: orange;">⚠ No card</span>'}`,e.classList.add("active")),Se(),typeof updateChargeSummary=="function"&&updateChargeSummary(),l.payment_method?be():confirm("This customer has no payment method on file. Would you like to add one now?")&&Ce(l.id)}}async function Ne(){if(!window.selectedBoat||!window.selectedBoat.customerId){alert("Please select a boat first");return}const l=Object.values(window.anodeCart||{});if(l.length===0){alert("No anodes selected");return}const e=parseFloat(document.getElementById("taxRate").value)/100,t=parseFloat(document.getElementById("markupRate").value)/100,n=parseFloat(document.getElementById("laborCharge").value),o=l.reduce((g,h)=>g+h.list_price*h.quantity,0),a=l.reduce((g,h)=>g+h.quantity,0)*n,s=o+a,r=s*t,d=s+r,c=d*e,m=d+c,y=l.map(g=>`${g.name} x${g.quantity}`).join(", "),u=document.querySelector(".charge-anode-btn");u.disabled=!0,u.textContent="Processing...";try{const h=await(await fetch(`${se}/charge-customer`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerId:window.selectedBoat.customerId,amount:Math.round(m*100),description:`Anode Replacement: ${y}`,metadata:{boat_id:window.selectedBoat.id,boat_name:window.selectedBoat.boatName,anode_items:l,subtotal:o,labor:a,markup:r,tax:c,service_date:document.getElementById("serviceDate").value}})})).json();if(h.success){alert("Payment successful!"),window.anodeCart={},updateAnodeCart();const w=document.querySelector(`.boat-schedule-item[data-boat-id="${window.selectedBoat.id}"]`);if(w){w.classList.add("completed");const v=w.querySelector(".boat-status");v&&(v.textContent="Completed",v.style.background="#95a5a6")}}else alert("Payment failed: "+h.error)}catch(g){alert("Error processing payment: "+g.message)}finally{u.disabled=!1,u.textContent="💳 Charge Customer"}}window.updateChargeSummary=function(){const l=document.querySelector(".charge-summary");if(window.updateWizardPricing&&(window.currentServiceKey==="recurring_cleaning"||window.currentServiceKey==="onetime_cleaning"||window.currentServiceKey==="anodes_only")){window.updateWizardPricing();return}const e=document.getElementById("chargeSummaryContent");if(!e)return;const t=window.currentServiceKey,n=window.selectedCustomer;if(!t){e.innerHTML="<p>Select a service to see pricing</p>",l&&(l.style.display="none");return}if(l&&(l.style.display="block"),!n){e.innerHTML="<p>Select a customer and service to see pricing</p>";return}e.innerHTML=`
        <div class="charge-detail-row">
            <span>Service:</span>
            <span>${t.replace(/_/g," ")}</span>
        </div>
        <div class="charge-detail-row">
            <span>Customer:</span>
            <span>${n.name||n.email}</span>
        </div>
        <div class="charge-detail-row">
            <span>Total:</span>
            <span>Calculate based on selections</span>
        </div>
    `;const o=document.getElementById("chargeButton");o&&(o.disabled=!n||!n.payment_method||!t)};window.chargeCustomer=be;window.updateChargeButton=Me;window.showPaymentMethodForm=Ce;window.closePaymentMethodForm=Ee;window.openCustomerSelectionModal=xe;window.closeCustomerSelectionModal=Se;window.selectModalCustomer=Re;window.confirmModalCustomerSelection=Fe;window.chargeAnodes=Ne;function Ie(){const l=new Date,e=l.getFullYear(),t=String(l.getMonth()+1).padStart(2,"0"),n=String(l.getDate()).padStart(2,"0"),o=Math.floor(Math.random()*1e4).toString().padStart(4,"0");return`INV-${e}${t}${n}-${o}`}async function Be(l,e,t,n){var o;try{const i=Ie(),a=((o=document.getElementById("paymentNotes"))==null?void 0:o.value)||"";let s="paid",r="succeeded",d="";switch(l){case"zoho":d="External Payment (Zoho)";break;case"cash":d="Cash Payment";break;case"check":d="Check Payment";break;case"pending":s="sent",r="pending",d="Payment Pending";break}const c=a?` - ${a}`:"",m=`${d}${c}`,{data:y,error:u}=await window.supabase.from("invoices").insert({customer_id:window.selectedCustomer.id,invoice_number:i,total:e,status:s,issued_date:new Date().toISOString().split("T")[0],due_date:new Date().toISOString().split("T")[0],paid_date:l!=="pending"?new Date().toISOString().split("T")[0]:null,notes:`${m}
Service: ${t}
Metadata: ${JSON.stringify(n)}`}).select().single();if(u)throw console.error("Invoice creation error:",u),new Error(`Failed to create invoice: ${u.message}`);const{data:g,error:h}=await window.supabase.from("payments").insert({invoice_id:y.id,customer_id:window.selectedCustomer.id,amount:e,status:r,payment_date:l!=="pending"?new Date().toISOString():null}).select().single();if(h)throw console.error("Payment creation error:",h),new Error(`Failed to create payment record: ${h.message}`);return{success:!0,invoice:y,payment:g,invoiceNumber:i}}catch(i){return console.error("Error creating external payment records:",i),{success:!1,error:i.message}}}window.updatePaymentMethodUI=function(){const l=document.getElementById("paymentMethodSelect"),e=document.getElementById("paymentNotes"),t=document.getElementById("chargeButton");if(!l||!t)return;const n=l.value;e&&(e.style.display=n!=="stripe"?"block":"none");const o={stripe:"💳 Charge Customer",zoho:"🏦 Record External Payment",cash:"💵 Record Cash Payment",check:"📝 Record Check Payment",pending:"⏳ Create Invoice (Payment Pending)"};t.innerHTML=o[n]||"💳 Charge Customer"};window.generateInvoiceNumber=Ie;window.createExternalPaymentRecords=Be;window.adminApp=new fe;window.updatePricing=window.updatePricing||function(){console.log("updatePricing called")};window.updateChargeSummary=function(){console.log("updateChargeSummary called"),window.adminApp&&typeof window.adminApp.updateChargeSummary=="function"&&window.adminApp.updateChargeSummary()};window.calculateCost=function(){console.log("calculateCost called"),window.updateWizardPricing&&window.updateWizardPricing(),window.updateChargeSummary&&window.updateChargeSummary()};document.addEventListener("DOMContentLoaded",function(){const l=new Date().toISOString().split("T")[0],e=document.getElementById("serviceDate");e&&(e.value=l);const t=document.getElementById("navToggle"),n=document.getElementById("navLinks");t&&n&&t.addEventListener("click",function(){n.classList.toggle("active"),t.classList.toggle("active")}),console.log("Functions loaded:",{renderConsolidatedForm:typeof window.renderConsolidatedForm,adminApp:typeof window.adminApp,updateWizardPricing:typeof window.updateWizardPricing}),setInterval(()=>{if(window.adminApp&&window.currentServiceKey){window.adminApp.currentServiceKey!==window.currentServiceKey&&(console.log("Syncing adminApp.currentServiceKey to:",window.currentServiceKey),window.adminApp.currentServiceKey=window.currentServiceKey);const o=document.getElementById("wizardContainer");if(o&&o.style.display==="block"){const i=document.getElementById("wizardTotalPrice");if(i){const a=i.textContent.replace("$","").replace(",",""),s=parseFloat(a)||0,r=document.getElementById("totalCost");if(r){const d=parseFloat(r.value)||0;Math.abs(d-s)>.01&&(r.value=s.toFixed(2),console.log("Synced price to:",s.toFixed(2)),typeof window.adminApp.updateChargeSummary=="function"&&window.adminApp.updateChargeSummary())}}}}},500)});function He(l={}){const{currentPage:e,onLogout:t}=l;return`
    <!-- Global Navigation Header -->
    <header class="global-header">
        <div class="global-nav-container">
            <a href="https://www.sailorskills.com/" class="nav-logo">SAILOR SKILLS</a>
            <nav class="global-nav">
                ${[{id:"portal",label:"Portal",url:"https://sailorskills-portal.vercel.app"},{id:"admin",label:"Admin",url:"https://sailorskills-billing.vercel.app/admin.html"},{id:"billing",label:"Billing",url:"https://sailorskills-billing.vercel.app"},{id:"inventory",label:"Inventory",url:"https://sailorskills-inventory.vercel.app"},{id:"schedule",label:"Schedule",url:"https://sailorskills-schedule.vercel.app"},{id:"estimator",label:"Estimator",url:"https://sailorskills-estimator.vercel.app"}].map(a=>{const s=a.id===e?' class="active"':"";return`<a href="${a.url}"${s}>${a.label}</a>`}).join(`
                `)}
            </nav>
            <button class="nav-btn logout-btn" onclick="${t||"window.supabaseAuth?.signOut()"}">🔒 Logout</button>
        </div>
    </header>`}function De(l){return!l||l.length===0?"":`
    <!-- Breadcrumb -->
    <div class="breadcrumb">
        ${l.map((t,n)=>n===l.length-1?`<span class="current">${t.label}</span>`:`<a href="${t.url}">${t.label}</a>
        <span class="separator">›</span>`).join(`
        `)}
    </div>`}function ye(l={}){const{currentPage:e,breadcrumbs:t,onLogout:n}=l,o=He({currentPage:e,onLogout:n}),i=t?De(t):"",a=document.body,s=document.createElement("div");for(s.innerHTML=o+i;s.firstChild;)a.insertBefore(s.firstChild,a.firstChild)}function Oe(l={}){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>ye(l)):ye(l)}Oe({currentPage:"billing",breadcrumbs:[{label:"Home",url:"https://www.sailorskills.com/"},{label:"Billing"}]});async function We(){const{data:{session:l}}=await window.supabase.auth.getSession();l?console.log("✅ User authenticated:",l.user.email):qe()}function qe(){document.querySelector(".main-content").style.display="none";const l=document.createElement("div");l.id="auth-modal",l.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `,l.innerHTML=`
                <div style="background: white; padding: 40px; border-radius: 12px; max-width: 400px; width: 90%;">
                    <h2 style="margin: 0 0 10px 0; color: #2c3e50; text-align: center;">🔒 Billing Admin</h2>
                    <p style="margin: 0 0 30px 0; color: #7f8c8d; text-align: center; font-size: 14px;">
                        Sign in to access customer billing
                    </p>
                    <form id="login-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Email</label>
                            <input
                                type="email"
                                id="auth-email"
                                required
                                placeholder="admin@sailorskills.com"
                                style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
                                autocomplete="email"
                            >
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Password</label>
                            <input
                                type="password"
                                id="auth-password"
                                required
                                placeholder="Enter your password"
                                style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
                                autocomplete="current-password"
                            >
                        </div>
                        <div id="auth-error" style="display: none; padding: 12px; background: #ffe6e6; border: 1px solid #ffcccc; border-radius: 6px; color: #d63031; font-size: 14px;"></div>
                        <button
                            type="submit"
                            style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.transform='translateY(0)'"
                        >
                            Sign In
                        </button>
                    </form>
                    <p style="margin: 20px 0 0 0; text-align: center; color: #95a5a6; font-size: 12px;">
                        Contact your administrator if you need access
                    </p>
                </div>
            `,document.body.appendChild(l),setTimeout(()=>document.getElementById("auth-email").focus(),100);const e=document.getElementById("login-form"),t=document.getElementById("auth-error");e.addEventListener("submit",async n=>{n.preventDefault(),t.style.display="none";const o=document.getElementById("auth-email").value,i=document.getElementById("auth-password").value,a=e.querySelector('button[type="submit"]');a.textContent="Signing in...",a.disabled=!0;try{const{data:s,error:r}=await window.supabase.auth.signInWithPassword({email:o,password:i});if(r)throw r;console.log("✅ Login successful:",s.user.email),l.remove(),document.querySelector(".main-content").style.display="block"}catch(s){console.error("Login error:",s),t.textContent=s.message||"Authentication failed",t.style.display="block",a.textContent="Sign In",a.disabled=!1,document.getElementById("auth-password").value="",document.getElementById("auth-password").focus()}})}window.logout=async function(){await window.supabase.auth.signOut(),window.location.reload()};We();
