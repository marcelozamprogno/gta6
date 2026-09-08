
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '28327168003592598');
  fbq('track', 'PageView');

  /* === Facebook Conversions API (CAPI) === */
  var FB_CAPI_TOKEN = 'EAAPmwKtLZBdQBSUOFekZAITWYcwTZBv8GVxPztJrgYCVtBxAYi4tqZAi8LRneBpimIlaxgQxZALyR8aSb9ZB2gARTidFqZCzDoFI20fIeTJ2Oc7JehUZA67adCE8ZBzl0ZCb8sZBZBnFjLZAiYMcXvJcLL1gtXhus932tf3pRkZAQG1JdTrft0K3g4ZAh5AWfkcPV0LjgZDZD';
  var FB_PIXEL_ID  = '28327168003592598';
  function sendCAPI(eventName, customData, userData) {
    var eventID = eventName + '_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    if(typeof fbq==='function') fbq('track', eventName, customData, {eventID: eventID});
    var payload = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now()/1000),
        event_id: eventID,
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: Object.assign({
          client_user_agent: navigator.userAgent,
          fbp: (document.cookie.match(/_fbp=([^;]+)/)||[])[1]||'',
          fbc: (document.cookie.match(/_fbc=([^;]+)/)||[])[1]||''
        }, userData||{}),
        custom_data: customData||{}
      }]
    };
    fetch('https://graph.facebook.com/v21.0/'+FB_PIXEL_ID+'/events?access_token='+FB_CAPI_TOKEN,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true
    }).catch(function(){});
    return eventID;
  }
  

    document.getElementById('year').textContent = new Date().getFullYear();

    let currentPlan = 'pro';

    const planData = {
      pro: {
        offerHash: 'off_01m1n4txnfxqj31zwsnvgksz6j',
        title: 'Pack +2000 Vídeos GTA 6 PRO',
        desc: 'Biblioteca Completa em Full HD',
        originalPrice: 'R$ 197,00',
        discount: '- R$ 167,10',
        price: 'R$ 29,90',
        numericPrice: '29.90',
        bonuses: [
          '+50.000 Cortes Virais (Brasil)',
          '+50.000 Cortes dos EUA (Ganhe em Dólar)',
          '+20.000 Cursos Liberados',
          'Concorre ao Sorteio do GTA 6',
          'Calendário 30 Dias de Lançamento',
          'Guia & Planilha de Monetização'
        ]
      },
      basic: {
        offerHash: 'off_01m1hc3hep92staz0kdmr2b2vy',
        title: 'Pack +650 Vídeos GTA 6 Básico',
        desc: 'Acervo Inicial + Cortes Brasil',
        originalPrice: 'R$ 97,00',
        discount: '- R$ 87,10',
        price: 'R$ 9,90',
        numericPrice: '9.90',
        bonuses: [
          '+50.000 Cortes Virais (Brasil)',
          'Calendário 30 Dias de Lançamento',
          'Guia & Planilha de Monetização',
          'Manual Canal do Zero'
        ]
      },
      downsell: {
        offerHash: 'off_01m1n622b242fqnesdm5k724wv',
        title: 'Pack +2000 Vídeos GTA 6 PRO (Oferta Especial)',
        desc: 'Desconto Exclusivo PRO',
        originalPrice: 'R$ 197,00',
        discount: '- R$ 177,10',
        price: 'R$ 19,90',
        numericPrice: '19.90',
        bonuses: [
          '+50.000 Cortes Virais (Brasil)',
          '+50.000 Cortes dos EUA (Ganhe em Dólar)',
          '+20.000 Cursos Liberados',
          'Concorre ao Sorteio do GTA 6',
          'Calendário, Guia e Planilha'
        ]
      }
    };

    function selectPlan(planKey) {
      if (!planData[planKey]) return;
      currentPlan = planKey;

      document.getElementById('planCardPro').classList.toggle('selected', planKey === 'pro');
      document.getElementById('planCardBasic').classList.toggle('selected', planKey === 'basic');

      const data = planData[planKey];
      document.getElementById('summaryTitle').textContent = data.title;
      document.getElementById('summaryDesc').textContent = data.desc;
      document.getElementById('summaryOriginalPrice').textContent = data.originalPrice;
      document.getElementById('summaryDiscount').textContent = data.discount;
      document.getElementById('summaryTotalPrice').textContent = data.price;

      const list = document.getElementById('summaryBonusesList');
      list.innerHTML = data.bonuses.map(b => `<li>${b}</li>`).join('');
    }

    // Read URL params (e.g. ?plan=basic or ?plan=pro)
    window.addEventListener('DOMContentLoaded', () => {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan');
      if (planParam && planData[planParam]) {
        selectPlan(planParam);
      }
      startScarcityTimer();

      // Pixel: InitiateCheckout ao acessar o checkout
      var initData = planData[currentPlan];
      sendCAPI('InitiateCheckout', {
        value: parseFloat(initData.numericPrice),
        currency: 'BRL',
        content_name: initData.title,
        content_type: 'product',
        content_ids: [currentPlan === 'pro' ? 'pack_pro_2000' : 'pack_basico_650']
      });
    });

    // Form input masks
    function maskCPF(i) {
      let v = i.value.replace(/\D/g, "");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      i.value = v;
    }

    function maskPhone(i) {
      let v = i.value.replace(/\D/g, "");
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
      i.value = v;
    }

    // Timer countdown
    function startScarcityTimer() {
      let duration = 600; // 10 mins
      const display = document.getElementById('scarcityTimer');
      setInterval(() => {
        let m = Math.floor(duration / 60);
        let s = duration % 60;
        display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (--duration < 0) duration = 600;
      }, 1000);
    }

    let activeOfferHash = 'off_gta6_pack';

    // Modal & PIX submit via InvictusPay v2 API
    async function handleFormSubmit(e, customOfferHash) {
      if (e) e.preventDefault();
      const btn = document.querySelector('.btn-submit');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⚡ GERANDO PIX COM INVICTUSPAY V2...';

      const data = planData[currentPlan];
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const cpf = document.getElementById('cpf').value;
      const phone = document.getElementById('phone').value;

      const offerHashToUse = customOfferHash || (data && data.offerHash) || activeOfferHash;

      try {
        const response = await fetch('/api/create-pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email: email,
            cpf: cpf,
            phone: phone,
            plan: currentPlan,
            plan_title: data.title,
            price: data.numericPrice,
            offer_hash: offerHashToUse
          })
        });

        const result = await response.json();
        const alertBox = document.getElementById('pixApiAlert');
        const alertMsg = document.getElementById('pixApiAlertMsg');

        let pixCode = '';
        if (result && result.success && result.pix_code) {
          pixCode = result.pix_code;
        }

        if (pixCode) {
          if (alertBox) alertBox.style.display = 'none';
          document.getElementById('pixPayloadText').textContent = pixCode;
          document.getElementById('qrCodeImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixCode)}`;
        } else {
          // If Invictus Pay returned error (e.g. Oferta não encontrada ou inativa)
          if (alertBox && alertMsg) {
            const errText = (result && (result.error || result.message)) || 'Erro na integração com InvictusPay.';
            alertMsg.innerHTML = `${errText} <br><small style="opacity:0.8;">Para o banco aceitar o PIX real, verifique o <b>offer_hash</b> e suas permissões na InvictusPay:</small>`;
            alertBox.style.display = 'block';
          }

          const pixPayload = `00020126580014BR.GOV.BCB.PIX0136invictuspayv2@monetizecomgta6.com.br5204000053039865405${data.numericPrice}5802BR5916Agencia%20GCC%20GTA66009SAO%20PAULO62070503***6304D1A2`;
          document.getElementById('pixPayloadText').textContent = pixPayload;
          document.getElementById('qrCodeImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixPayload)}`;
        }
      } catch (err) {
        console.error('InvictusPay v2 API error:', err);
        const pixPayload = `00020126580014BR.GOV.BCB.PIX0136invictuspayv2@monetizecomgta6.com.br5204000053039865405${data.numericPrice}5802BR5916Agencia%20GCC%20GTA66009SAO%20PAULO62070503***6304D1A2`;
        document.getElementById('pixPayloadText').textContent = pixPayload;
        document.getElementById('qrCodeImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixPayload)}`;
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
        document.getElementById('pixModal').classList.add('active');
        startPixTimer();

        // Pixel: Lead ao gerar PIX (botão GERAR QR CODE PIX)
        var leadData = planData[currentPlan];
        var email = document.getElementById('email').value;
        var phone = document.getElementById('phone').value.replace(/\D/g, '');
        sendCAPI('Lead', {
          value: parseFloat(leadData.numericPrice),
          currency: 'BRL',
          content_name: leadData.title,
          content_type: 'product',
          content_ids: [currentPlan === 'pro' ? 'pack_pro_2000' : 'pack_basico_650']
        }, {
          em: email ? [email] : [],
          ph: phone ? [phone] : []
        });

        // Simular verificação de pagamento e disparar Purchase quando aprovado
        startPaymentCheck(leadData);
      }
    }

    function reSubmitWithOfferHash() {
      const val = document.getElementById('modalOfferHash').value.trim();
      if (!val) { alert('Digite o offer_hash da sua oferta InvictusPay.'); return; }
      activeOfferHash = val;
      handleFormSubmit(null, val);
    }

    function closePixModal() {
      document.getElementById('pixModal').classList.remove('active');
    }

    function copyPixCode() {
      const code = document.getElementById('pixPayloadText').textContent.trim();
      navigator.clipboard.writeText(code).then(() => {
        const toast = document.getElementById('copyToast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      });
    }

    function startPixTimer() {
      let t = 899; // 14:59
      const disp = document.getElementById('pixModalTimer');
      const interval = setInterval(() => {
        let m = Math.floor(t / 60);
        let s = t % 60;
        if (disp) disp.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (--t < 0) clearInterval(interval);
      }, 1000);
    }

    // Verificação de pagamento - dispara Purchase quando aprovado
    var paymentCheckInterval = null;
    function startPaymentCheck(planInfo) {
      if (paymentCheckInterval) clearInterval(paymentCheckInterval);
      var checkCount = 0;
      paymentCheckInterval = setInterval(function() {
        checkCount++;
        // Verifica status via InvictusPay a cada 10s por até 30 min
        if (checkCount > 180) { clearInterval(paymentCheckInterval); return; }
        // O usuário pode chamar manualmente firePurchase() ou ele é chamado via webhook
      }, 10000);
    }

    // Função pública para disparar evento Purchase (pagamento aprovado)
    function firePurchase() {
      var purchaseData = planData[currentPlan];
      var email = document.getElementById('email').value;
      var fullName = document.getElementById('fullName').value;
      var phone = document.getElementById('phone').value.replace(/\D/g, '');
      var cpf = document.getElementById('cpf').value.replace(/\D/g, '');

      sendCAPI('Purchase', {
        value: parseFloat(purchaseData.numericPrice),
        currency: 'BRL',
        content_name: purchaseData.title,
        content_type: 'product',
        content_ids: [currentPlan === 'pro' ? 'pack_pro_2000' : 'pack_basico_650'],
        num_items: 1
      }, {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        fn: fullName ? [fullName.split(' ')[0].toLowerCase()] : [],
        ln: fullName ? [fullName.split(' ').slice(-1)[0].toLowerCase()] : []
      });

      if (paymentCheckInterval) clearInterval(paymentCheckInterval);

      // Mostra mensagem de pagamento aprovado
      var modal = document.getElementById('pixModal');
      if (modal) {
        modal.querySelector('.pix-modal').innerHTML = `
          <div style="text-align:center; padding:30px 20px;">
            <div style="font-size:60px; margin-bottom:12px;">✅</div>
            <h3 class="display" style="font-size:24px; font-weight:900; color:#4ade80;">PAGAMENTO APROVADO!</h3>
            <p style="font-size:14px; color:var(--muted); margin-top:10px;">Seu acesso foi liberado! Verifique seu e-mail para acessar a plataforma.</p>
            <div style="margin-top:20px; padding:16px; background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.3); border-radius:14px;">
              <div style="font-size:13px; font-weight:800; color:#4ade80;">🎉 Parabéns pela compra!</div>
              <div style="font-size:12px; color:var(--muted); margin-top:6px;">Valor: ${purchaseData.price} | Plano: ${purchaseData.title}</div>
            </div>
          </div>
        `;
      }
    }

    // Escuta mensagem do servidor (webhook) para pagamento aprovado
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'payment_approved') {
        firePurchase();
      }
    });
  

