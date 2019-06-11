/**
 * 结构图渲染函数
 * @namespace sDrawing
 * @requires jQuery
 * @author zhangzicao
 * @version 0.1.0
 * @param  {string} id       容器选择器
 * @param  {Object[]} dataList 渲染用数据
 * @param  {string} dataList[].title 节点标题
 * @param  {number} dataList[].type=1 节点显示类型，可选1,2
 * @param  {string} dataList[].extendClass 给节点添加类名
 * @param  {Object} dataList[].styles 给节点添加样式，格式参考jq
 * @param  {string[]} dataList[].data 节点数据（hover后显示）
 * @param  {Object[]} dataList[].children 子节点列表，格式与datalist一致
 * @param  {number} dataList[].branch=1 分支图形类型，设为1默认使用分支线，设为2默认使用括号
 * @param  {object} option 渲染配置
 * @param  {number} option.branch=1 分支图形，设为1默认使用分支线，设为2默认使用括号
 * @param  {number} option.nodeWidth=160 终结点的宽度
 * @param  {number} option.parentWidth=160 非终结点的宽度
 * @param  {boolean} option.vertical=false 是否开启纵向模式
 * @param  {string} option.cursor=default 鼠标放在节点上时的鼠标类型
 * @param  {function} option.onClick 点击节点时的回调，参数1为event对象，参数2位当前节点的数据
 */
(function(root,factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS.
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals.
    root.sDrawing = factory(root.jQuery);
  }
})(this,function(jquery){
  var $ = jquery;

  var sDrawing=function(id,dataList,option){
    var defaultOption={// 默认配置
      branch:0,
      nodeWidth:160,
      parentWidth:160,
      vertical:false,
      cursor:'default'
    };
    option=$.extend({},defaultOption,option);

    if(option.cursor=='pointer'){
      $(id).addClass('sDrawing-hover-pointer')
    }

    var simpleData={};

    var html=renderList(dataList)
    function renderList(list){
      var html='';
      $.each(list,function(i,item){
        if(!item.sDrawingId){
          item.sDrawingId = ++sDrawing.index;
          simpleData[item.sDrawingId]=item;
        }

        var $item=$('<div class="sDrawing-item"><div class="sDrawing-item-title" data-sdrawid="'+item.sDrawingId+'"></div></div>');
        $item.find(".sDrawing-item-title").text(item.title);

        //节点类型
        if (item.type==2) {
          $item.addClass('sDrawing-item--type-2')
        }else{
          $item.addClass('sDrawing-item--type-1')
        }

        //显示数据
        if (item.data&&item.data.length>0) {
          var $data=$('<div class="sDrawing-item-data"><div class="sDrawing-item-data-list"></div></div>');
          $.each(item.data,function(j,str){
            var $row=$('<div class="sDrawing-item-data-one"></div>');
            $row.text(str);
            $row.appendTo($data.find('.sDrawing-item-data-list'))
          });
          $data.appendTo($item.find('.sDrawing-item-title'));
          $item.addClass('has-data')
        }

        // 子节点
        if (item.children&&item.children.length>0) {
          $item.append($('<div class="sDrawing-item-contain"></div>').html(renderList(item.children)).prepend('<div class="sDrawing-item-contain-sign"><span class="sDrawing-item-contain-sign-inner-1"></span><span class="sDrawing-item-contain-sign-inner-2"></span></div>'));

          //分支图标类型
          if (item.branch==1) {
            $item.children('.sDrawing-item-contain').addClass('contain-type-1');
          }else if (item.branch==2 || option.branch==2) {
            $item.children('.sDrawing-item-contain').addClass('contain-type-2');
          }else{
            $item.children('.sDrawing-item-contain').addClass('contain-type-1');
          }
        }

        //节点样式
        if (item.styles) {
          $item.css(item.styles)
        }


        html+=$('<div></div>').append($item).html();
        $item=null;
      })
      return html
    }
    $(id).html(html)
    if(option.vertical) $(id).addClass('sDrawing-vertical')

    //事件绑定
    if(option.onClick){
      $(id).on('click','.sDrawing-item-title',function (e) {
        option.onClick(e,simpleData[$(this).data('sdrawid')])
      })
    }

    $(id).find('.sDrawing-item--type-2>.sDrawing-item-title').width(option.nodeWidth)
    $(id).find('.sDrawing-item--type-1>.sDrawing-item-title').width(option.parentWidth)
    $(id).find('.sDrawing-item-contain').each(function(){
      //渲染分支
      var that=this;
      var h=$(this).height();
      var w=$(this).width();
      var mT=$(this).children('.sDrawing-item:first').height()/2;
      var mB=$(this).children('.sDrawing-item:last').height()/2;
      var mL=$(this).children('.sDrawing-item:first').width()/2;
      var mR=$(this).children('.sDrawing-item:last').width()/2;
      var rd_1=function(){
        if ($(that).closest('.sDrawing-vertical').length==0) {
          $(that).children('.sDrawing-item-contain-sign').css({
            "top":mT+'px',
            "bottom":mB+'px',
          })
        }else{
          $(that).children('.sDrawing-item-contain-sign').css({
            "left":mL+'px',
            "right":mR+'px',
          })

        }
      };
      var rd_2=function(){
        var vh=h-mT-mB;
        var vw=w-mL-mR;
        if ($(that).closest('.sDrawing-vertical').length==0) {
          if (h-mT-mB<40) {
            var dis=(40-h+mT+mB)/2
            mT=mT-dis;
            mB=mB-dis;
          }
          var spanPos=(mT-mB)/2;
          $(that).children('.sDrawing-item-contain-sign').css({
            "top":mT+'px',
            "bottom":mB+'px'
          }).find('.sDrawing-item-contain-sign-inner-1').css({
            "margin-bottom":spanPos+12+'px'
          }).siblings('.sDrawing-item-contain-sign-inner-2').css({
            "margin-top":-spanPos+12+'px'
          })
        }else{
          if (w-mL-mR<40) {
            var dis=(40-w+mL+mR)/2
            mL=mL-dis;
            mR=mR-dis;
          }
          var spanPos=(mL-mR)/2;
          $(that).children('.sDrawing-item-contain-sign').css({
            "left":mL+'px',
            "right":mR+'px'
          }).find('.sDrawing-item-contain-sign-inner-1').css({
            "margin-right":spanPos+12+'px'
          }).siblings('.sDrawing-item-contain-sign-inner-2').css({
            "margin-left":-spanPos+12+'px'
          })
        }
      };
      if ($(that).hasClass('contain-type-1')) rd_1();
      else if ($(that).hasClass('contain-type-2')) rd_2();
      else rd_1();
      rd_1=rd_2=null;
    })
  }
  sDrawing.index=1;

  return sDrawing;
});
