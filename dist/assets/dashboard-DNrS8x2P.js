import"./modulepreload-polyfill-B5Qt9EMX.js";import{createClient as b}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";const m="https://fzygakldvvzxmahkdylq.supabase.co",u="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eWdha2xkdnZ6eG1haGtkeWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODM4OTgsImV4cCI6MjA2OTY1OTg5OH0.8BNDF5zmpk2HFdprTjsdOWTDh_XkAPdTnGo7omtiVIk",d=b(m,u);let p=null,l=[];window.addEventListener("DOMContentLoaded",async()=>{const{data:{session:e}}=await d.auth.getSession();e&&(p=e.user,v())});document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("admin-email").value,s=document.getElementById("admin-password").value,o=document.getElementById("login-error");try{const{data:n,error:a}=await d.auth.signInWithPassword({email:t,password:s});if(a)throw a;p=n.user,v()}catch(n){o.textContent=n.message,o.style.display="block"}});async function v(){document.getElementById("login-section").style.display="none",document.getElementById("admin-dashboard").style.display="block",await y()}async function y(){try{const{data:e,error:t}=await d.from("service_orders").select(`
                        *,
                        customer:customers!service_orders_customer_id_fkey(
                            id, name, email, phone
                        ),
                        boat:boats!service_orders_boat_id_fkey(
                            name, make, model, length
                        ),
                        marina:marinas!service_orders_marina_id_fkey(
                            name
                        )
                    `).order("created_at",{ascending:!1});if(t)throw t;l=e||[],f()}catch(e){console.error("Error loading orders:",e),alert("Error loading orders. Please refresh the page.")}}function f(){const e=l.filter(a=>a.status==="pending"),t=l.filter(a=>a.status==="completed"),s=document.getElementById("pending-orders-grid");s.innerHTML=e.length?e.map(a=>c(a)).join(""):'<p style="text-align: center; color: #666;">No pending orders</p>';const o=document.getElementById("completed-orders-grid");o.innerHTML=t.length?t.map(a=>c(a)).join(""):'<p style="text-align: center; color: #666;">No completed orders</p>';const n=document.getElementById("all-orders-grid");n.innerHTML=l.length?l.map(a=>c(a)).join(""):'<p style="text-align: center; color: #666;">No orders found</p>'}function c(e){var s,o,n,a;e.service_interval&&e.service_interval;const t={1:"Monthly",2:"Bi-Monthly",3:"Quarterly",6:"Semi-Annual"}[e.service_interval]||"One-Time";return`
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-number">${e.order_number}</span>
                        <span class="order-status status-${e.status}">${e.status.toUpperCase()}</span>
                    </div>
                    
                    <div class="order-details">
                        <div class="detail-item">
                            <span class="detail-label">Customer</span>
                            <span class="detail-value">${((s=e.customer)==null?void 0:s.name)||"N/A"}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Boat</span>
                            <span class="detail-value">${((o=e.boat)==null?void 0:o.name)||"N/A"} (${((n=e.boat)==null?void 0:n.length)||"?"}ft)</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Service</span>
                            <span class="detail-value">${e.service_type}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Interval</span>
                            <span class="detail-value">${t}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Marina</span>
                            <span class="detail-value">${((a=e.marina)==null?void 0:a.name)||"N/A"}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Slip</span>
                            <span class="detail-value">${e.dock} - ${e.slip_number}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estimate</span>
                            <span class="detail-value">$${e.estimated_amount}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created</span>
                            <span class="detail-value">${new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        ${e.status==="pending"?`
                            <button class="btn btn-primary" onclick="openCompleteModal('${e.id}')">
                                Complete Service
                            </button>
                        `:`
                            <span style="color: #28a745;">✓ Charged $${e.final_amount||e.estimated_amount}</span>
                        `}
                        <button class="btn btn-secondary" onclick="viewDetails('${e.id}')">
                            View Details
                        </button>
                    </div>
                </div>
            `}window.switchTab=function(e){document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active")),event.target.classList.add("active"),document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active")),document.getElementById(`${e}-orders`).classList.add("active")};window.openCompleteModal=function(e){var s;const t=l.find(o=>o.id===e);t&&(document.getElementById("complete-order-id").value=e,document.getElementById("modal-order-number").textContent=t.order_number,document.getElementById("modal-customer-name").textContent=((s=t.customer)==null?void 0:s.name)||"N/A",document.getElementById("modal-service-type").textContent=t.service_type,document.getElementById("final-amount").value=t.estimated_amount,document.getElementById("original-estimate").textContent=t.estimated_amount,document.getElementById("service-notes").value="",document.getElementById("complete-service-modal").style.display="block")};window.closeModal=function(){document.getElementById("complete-service-modal").style.display="none"};document.getElementById("complete-service-form").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("complete-order-id").value,s=parseFloat(document.getElementById("final-amount").value),o=document.getElementById("service-notes").value,n=e.target.querySelector('button[type="submit"]');n.disabled=!0,n.textContent="Processing...";try{const a=await fetch(`${m}/functions/v1/charge-for-service`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify({orderId:t,finalAmount:s,notes:o})});if(!a.ok){const r=await a.json();throw new Error(r.error||"Failed to charge customer")}const i=await a.json();alert(`Success! Charged $${i.amountCharged} to customer.`),closeModal(),await y()}catch(a){console.error("Error:",a),alert(`Error: ${a.message}`)}finally{n.disabled=!1,n.textContent="Charge Customer & Complete"}});window.viewDetails=function(e){var s,o,n,a,i,r;const t=l.find(g=>g.id===e);t&&alert(`Order Details:

Order: ${t.order_number}
Customer: ${(s=t.customer)==null?void 0:s.name} (${(o=t.customer)==null?void 0:o.email})
Phone: ${(n=t.customer)==null?void 0:n.phone}
Boat: ${(a=t.boat)==null?void 0:a.name} - ${(i=t.boat)==null?void 0:i.make} ${(r=t.boat)==null?void 0:r.model}
Service: ${t.service_type}
Status: ${t.status}
Created: ${new Date(t.created_at).toLocaleString()}`)};window.logout=async function(){await d.auth.signOut(),location.reload()};
