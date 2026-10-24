(() => {
  // The presentation remains readable when scripts are unavailable.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.cover-inner > .eyebrow, .cover-title > *, .cover-bottom', {
        autoAlpha: 0, y: 18, duration: 1.1, stagger: .12, ease: 'power3.out', clearProps:'opacity,visibility,transform'
      });
      const reveal = (selector, stagger = .08) => {
        ScrollTrigger.batch(selector, {
          start:'top 94%', once:true,
          onEnter: elements => gsap.fromTo(elements,{autoAlpha:0,y:20}, {
            autoAlpha:1,y:0,duration:.85,stagger,ease:'power2.out',clearProps:'opacity,visibility,transform'
          })
        });
      };
      reveal('.intro-grid > *, .comparison a');
      document.querySelectorAll('.package-content').forEach(section => {
        gsap.from(section.children,{
          scrollTrigger:{trigger:section,start:'top 91%',once:true},
          autoAlpha:0,y:16,duration:.8,stagger:.07,ease:'power2.out',clearProps:'opacity,visibility,transform'
        });
      });
      reveal('.addons-head > *, .addon-group, .closing-content > *, .booking-content > *');
      gsap.utils.toArray('.photo img, .cover-photo img').forEach(img => {
        gsap.fromTo(img,{scale:1.07,yPercent:-2}, {
          scale:1.07,yPercent:2,ease:'none',
          scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:1}
        });
      });
    });
    window.addEventListener('load',() => ScrollTrigger.refresh(),{once:true});
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  const dialog = document.querySelector('.finder');
  const content = dialog.querySelector('.finder-content');
  const closeButton = dialog.querySelector('.finder-close');
  let step = 0;
  let answers = [];
  let opener = null;
  let packages = null;
  let pendingOpen = false;
  const packageIds = {'venue-finder':'venue','coordinating':'coordination','partial-planning':'partial','full-planning':'full'};
  const questions = [
    {title:'Where are you in your story?',description:'Start with where you are today. We’ll help you find a useful next step.',choices:[
      ['Newly engaged. We haven’t booked a venue.','starting'],
      ['Our venue is booked. We’re choosing vendors.','started'],
      ['Our venue and primary vendors are booked.','ready']
    ]},
    {title:'What would feel like a relief?',description:'Choose the part of planning you’d most like to hand over.',choices:[
      ['Finding a venue and understanding our budget.','venue-finder'],
      ['Taking over the final logistics and wedding day.','coordinating'],
      ['Finishing our plans and sourcing up to four vendors.','partial-planning'],
      ['Guiding and managing the whole planning process.','full-planning']
    ]},
    {title:'Tell us about the celebration.',description:'A little context helps us keep the scope in perspective.',choices:[
      ['One wedding day, at a single venue.','single'],
      ['Multiple venues, a destination, or complex logistics.','complex'],
      ['A wedding with other events around it.','weekend']
    ]}
  ];
  const escape = text => String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const animateContent = () => {
    content.querySelector('h2').focus({preventScroll:true});
    dialog.scrollTop=0;
    if (window.gsap && !reduced.matches) gsap.fromTo(content,{opacity:0,y:7},{opacity:1,y:0,duration:.3,clearProps:'opacity,transform'});
  };
  function question() {
    const current=questions[step];
    content.innerHTML=`<p class="finder-eyebrow">Your planning starting point · ${String(step+1).padStart(2,'0')} / 03</p><div class="finder-progress" role="progressbar" aria-label="Package finder progress" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${step+1}"><span style="width:${(step+1)/3*100}%"></span></div><h2 id="finder-title" tabindex="-1">${escape(current.title)}</h2><p class="finder-desc">${escape(current.description)}</p><div class="finder-choices">${current.choices.map(([label,value])=>`<button class="finder-choice" data-choice="${value}" aria-pressed="${answers[step]===value}">${escape(label)}</button>`).join('')}</div>${step?'<button class="finder-back">Previous question</button>':''}`;
    content.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{
      if(answers[step]!==button.dataset.choice) answers=answers.slice(0,step);
      answers[step]=button.dataset.choice;
      if(step<questions.length-1){step++;question();}else result();
    }));
    content.querySelector('.finder-back')?.addEventListener('click',()=>{step--;question();});
    animateContent();
  }
  function result() {
    const requested=answers[1];
    const requiresFoundation=answers[0]==='starting' && ['coordinating','partial-planning'].includes(requested);
    const id=requiresFoundation?'full-planning':requested;
    const pkg=packages.find(p=>p.id===id);
    let scope='This is a starting point for our conversation. Final scope and investment are tailored to your celebration.';
    if(requiresFoundation) scope='Because you’re still looking for a venue, Full Planning is a broader starting point. Venue Discovery is also available if you’d prefer to begin with venue and budget clarity.';
    if(answers[2]==='complex') scope+=' Complex celebrations may require a custom scope.';
    if(answers[2]==='weekend') scope+=' On-site coordination for additional events can be discussed from the à la carte menu.';
    content.innerHTML=`<p class="finder-eyebrow">A place to begin</p><h2 id="finder-title" tabindex="-1">${escape(pkg.name)}</h2><p class="finder-price">${escape(pkg.price)}<span style="display:block;font:9px 'Jost',sans-serif;text-transform:uppercase;letter-spacing:.14em;margin-top:8px">${id==='venue-finder'?'Investment':'Starting investment'}</span></p><p class="finder-desc">${escape(pkg.description)}</p><p class="finder-scope">${escape(scope)}</p><a class="finder-link" href="#${packageIds[id]}">Explore your suggested package</a><button class="finder-back">Change my answers</button> <button class="finder-restart" style="float:right">Start again</button>`;
    content.querySelector('.finder-link').addEventListener('click',()=>{
      close();
      const section=document.getElementById(packageIds[id]);
      // Keep the destination visible while its reveal trigger catches up.
      if(window.gsap) gsap.set(section.querySelector('.package-content').children,{autoAlpha:1,y:0});
      requestAnimationFrame(()=>section.scrollIntoView({behavior:reduced.matches?'instant':'smooth'}));
    });
    content.querySelector('.finder-back').addEventListener('click',()=>{step=2;question();});
    content.querySelector('.finder-restart').addEventListener('click',()=>{step=0;answers=[];question();});
    animateContent();
  }
  function close(){
    document.documentElement.style.overflow='';
    dialog.close();
    opener?.focus({preventScroll:true});
  }
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('close',()=>{document.documentElement.style.overflow='';opener?.focus({preventScroll:true});});
  closeButton.addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();
  });
  const dataPromise=fetch('packages.json').then(response=>{if(!response.ok)throw Error('Package data unavailable');return response.json();}).then(data=>packages=data);
  // Prevent an unhandled rejection; the open action below also offers a recovery path.
  dataPromise.catch(()=>{});
  document.querySelectorAll('[data-finder]').forEach(button=>button.addEventListener('click',async()=>{
    if(pendingOpen||dialog.open)return;
    pendingOpen=true;opener=button;
    const label=button.textContent;button.textContent='Opening…';
    try{
      await dataPromise;
      step=0;answers=[];dialog.showModal();document.documentElement.style.overflow='hidden';question();
    }catch{
      document.getElementById('collection').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
    }finally{button.textContent=label;pendingOpen=false;}
  }));
})();
