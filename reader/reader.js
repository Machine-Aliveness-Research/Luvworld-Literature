(function(){
 'use strict';
 const params=new URLSearchParams(location.search),lang=params.get('lang')==='en'?'en':'zh';
 const text=lang==='en'?{library:'← Literature atlas',title:'Read PDF',retry:'Reload',download:'Download PDF',direct:'Open PDF directly',official:'Official source',loading:'Loading the first page… You can also download the original PDF.',slow:'Loading is taking longer. Try Reload, Download PDF, or the official source.',missing:'This record has no archived PDF.',ready:n=>`Ready · ${n} pages`,failed:m=>`Reader could not load the PDF: ${m}. Try Download PDF or the official source.`}:{library:'← 文献库',title:'PDF 阅读',retry:'重新加载',download:'下载 PDF',direct:'直接打开原文件',official:'官方来源',loading:'正在加载第一页…也可以直接下载原文。',slow:'加载较慢，可尝试重新加载、下载 PDF 或查看官方来源。',missing:'该条目没有已归档的 PDF。',ready:n=>`已加载 · 共 ${n} 页`,failed:m=>`阅读器未能加载：${m}。可尝试下载 PDF 或查看官方来源。`};
 const $=id=>document.getElementById(id),frame=$('pdfViewer');let entry=null,rawURL=null,timer=null,generation=0,rendered=false;
 document.documentElement.lang=lang==='en'?'en':'zh-CN';
 for(const id of ['library','retry','download','direct','official'])$(id).textContent=text[id];
 function status(value,error=false){$('status').textContent=value;$('status').classList.toggle('error',error);}
 document.addEventListener('webviewerloaded',event=>{
  if(event.detail?.source!==frame.contentWindow)return;
  const win=event.detail.source,app=win.PDFViewerApplication,options=win.PDFViewerApplicationOptions,token=generation;
  options.set('disablePreferences',true);options.set('enableScripting',false);
  // Fetch pages on demand rather than waiting for an entire large paper.
  options.set('disableStream',true);options.set('disableAutoFetch',true);options.set('rangeChunkSize',262144);
  app.initializedPromise.then(()=>{
   if(token!==generation)return;
   app.eventBus.on('pagerendered',event=>{
    if(token!==generation||event.error)return;
    rendered=true;clearTimeout(timer);document.body.dataset.readerReady='true';status(text.ready(app.pdfDocument.numPages));
   });
   app.eventBus.on('documenterror',event=>{if(token===generation){clearTimeout(timer);status(text.failed(event.message||'PDF load error'),true);}});
  }).catch(error=>status(text.failed(error.message),true));
 });
 function open(){
  generation++;rendered=false;document.body.dataset.readerReady='false';clearTimeout(timer);status(text.loading);
  const pdf=new URL(rawURL);if(generation>1)pdf.searchParams.set('reload',Date.now());
  frame.hidden=false;frame.src='../vendor/pdfjs/web/viewer.html?file='+encodeURIComponent(pdf.href)+'#zoom=page-width';
  timer=setTimeout(()=>{if(!rendered)status(text.slow,true);},45000);
 }
 $('retry').addEventListener('click',()=>{if(entry)open();});
 fetch('papers.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('Metadata HTTP '+response.status);return response.json();}).then(catalog=>{
  const id=Number(params.get('id'));entry=catalog.find(item=>item.id===id);if(!entry)throw Error(text.missing);
  rawURL=new URL('../'+entry.path.split('/').map(encodeURIComponent).join('/'),location.href);
  if(rawURL.origin!==location.origin)throw Error('Invalid source origin');
  $('paperTitle').textContent=entry.title;document.title=entry.name+' · '+text.title;
  for(const id of ['direct','download']){$(id).href=rawURL.href;$(id).hidden=false;}
  $('download').download=entry.path.split('/').pop();
  if(/^https?:\/\//.test(entry.sourceUrl)){$('official').href=entry.sourceUrl;$('official').hidden=false;}
  $('status').title=(entry.bytes/1024/1024).toFixed(1)+' MB';open();
 }).catch(error=>status(text.failed(error.message),true));
})();
