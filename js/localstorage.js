/**
 * ע�������ռ�
 * @param {String} fullNS �����������ռ��ַ�������qui.dialog
 * @param {Boolean} isIgnorSelf �Ƿ�����Լ���Ĭ��Ϊfalse��������
 * @author zhaoxianlie��xianliezhao@foxmail.com��
 * @example
 *      window.registNS("QingFeed.Text.Bold");
 */
window.registNS = function(fullNS,isIgnorSelf){
    //�����ռ�Ϸ���У������
    var reg = /^[_$a-z]+[_$a-z0-9]*/i;
         
    // �������ռ��г�N����, ����baidu.libs.Firefox��
    var nsArray = fullNS.split('.');
    var sEval = "";
    var sNS = "";
    var n = isIgnorSelf ? nsArray.length - 1 : nsArray.length;
    for (var i = 0; i < n; i++){
        //�����ռ�Ϸ���У��
        if(!reg.test(nsArray[i])) {
            throw new Error("Invalid namespace:" + nsArray[i] + "");
            return ;
        }
        if (i != 0) sNS += ".";
        sNS += nsArray[i];
        // ���δ������������ռ���󣨼��粻���ڵĻ��������
        sEval += "if(typeof(" + sNS + ")=='undefined') " + sNS + "=new Object();else " + sNS + ";";
    }
    //���������ռ�
    if (sEval != "") {
        return eval(sEval);
    }
    return {};
};


/**
 * ע�������ռ�
 */
window.registNS('qext');

/**
 * @class qext.LocalStorage
 * ��������ı��ش洢ʵ�֡��߼������ʹ��localstorage��ieʹ��UserData����Ȼ˵�Ǳ��ش洢��Ҳ�벻Ҫ�洢�������ݣ���ò�Ҫ����64K.
 * ��Ϊie��UserDataÿҳ���洢��64k��
 * @singleton
 * @author zhaoxianlie (xianliezhao@foxmail.com)
 */
(function(){
    /**
     * ��֤�ַ����Ƿ�Ϸ��ļ���
     * @param {Object} key ����֤��key
     * @return {Boolean} true���Ϸ���false�����Ϸ�
     * @private
     */
    function _isValidKey(key) {
        return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
    }
    
    //���е�key
    var _clearAllKey = "_baidu.ALL.KEY_";
    
    /**
     * ��������ȡ���input:hiddenʵ��
     * @return {HTMLInputElement} input:hiddenʵ��
     * @private
     */
    function _getInstance(){
        //��UserData�󶨵�input:hidden��
        var _input = null;
        //�ǵģ���Ҫ���ȣ�����ÿ�ζ��ᴴ��һ��input:hidden�����ӵ�DOM����
        //Ŀ���Ǳ������ݱ��ظ�д�룬������ɡ����̿ռ�д������Exception
        _input = document.createElement("input");
        _input.type = "hidden";
        _input.addBehavior("#default#userData");
        document.body.appendChild(_input); 
        return _input;
    }
    
    /**
     * ������ͨ��UserData�ķ�ʽ���浽���أ��ļ���Ϊ���ļ���Ϊ��config.key[1].xml
     * @param {String} key ���洢���ݵ�key����config�����е�key��һ����
     * @param {Object} config ���洢�����������
     * @cofnig {String} key ���洢���ݵ�key
     * @config {String} value ���洢���ݵ�����
     * @config {String|Object} [expires] ���ݵĹ���ʱ�䣬���������֣���λ�Ǻ��룻Ҳ���������ڶ��󣬱�ʾ����ʱ��
     * @private
     */
    function __setItem(key,config){
        try {
            var input = _getInstance();
            //����һ��Storage����
            var storageInfo = config || {};
            //���ù���ʱ��
            if(storageInfo.expires) {
                var expires;
                //������������expiresΪ���֣����ʾ���ݵ��ܴ��ĺ�����
                if ('number' == typeof storageInfo.expires) {
                    expires = new Date();
                    expires.setTime(expires.getTime() + storageInfo.expires);
                }
                input.expires = expires.toUTCString();
            }
            
            //�洢����
            input.setAttribute(storageInfo.key,storageInfo.value);
            //�洢�������ļ����ļ���Ϊ��storageInfo.key[1].xml
            input.save(storageInfo.key);
        } catch (e) {
        }
    }

    /**
     * ������ͨ��UserData�ķ�ʽ���浽���أ��ļ���Ϊ���ļ���Ϊ��config.key[1].xml
     * @param {String} key ���洢���ݵ�key����config�����е�key��һ����
     * @param {Object} config ���洢�����������
     * @cofnig {String} key ���洢���ݵ�key
     * @config {String} value ���洢���ݵ�����
     * @config {String|Object} [expires] ���ݵĹ���ʱ�䣬���������֣���λ�Ǻ��룻Ҳ���������ڶ��󣬱�ʾ����ʱ��
     * @private
     */
    function _setItem(key,config){
        //������Ч����
        __setItem(key,config);
        
        //����Ĵ���������¼��ǰ�����key�������Ժ�clearAll
        var result = _getItem({key : _clearAllKey});
        if(result) {
            result = {
                key : _clearAllKey,
                value : result 
            };
        } else {
            result = {
                key : _clearAllKey,
                value : ""
            };
        }
        
        if(!(new RegExp("(^|\\|)" + key + "(\\||$)",'g')).test(result.value)) {
            result.value += "|" + key;
            //�����
            __setItem(_clearAllKey,result);     
        }
    }
    
    /**
     * ��ȡ���ش洢������
     * @param {String} config ����ȡ�Ĵ洢�����������
     * @cofnig {String} key ����ȡ�����ݵ�key
     * @return {String} ���ش洢�����ݣ���ȡ����ʱ����null
     * @example 
     * qext.LocalStorage.get({
     *      key : "username"
     * });
     * @private
     */
    function _getItem(config){
        try {
            var input = _getInstance();
            //���뱾���ļ����ļ���Ϊ��config.key[1].xml
            input.load(config.key);
            //ȡ������
            return input.getAttribute(config.key) || null;
        } catch (e) {
            return null;            
        }
    }
    
    /**
     * �Ƴ�ĳ��洢����
     * @param {Object} config ���ò���
     * @cofnig {String} key ���洢���ݵ�key
     * @private
     */
    function _removeItem(config){
		try {
			var input = _getInstance();
			//����洢����
			input.load(config.key);
			//�Ƴ�������
			input.removeAttribute(config.key);
			//ǿ��ʹ�����
			var expires = new Date();
			expires.setTime(expires.getTime() - 1);
			input.expires = expires.toUTCString();
			input.save(config.key);
			
			//��allkey��ɾ����ǰkey			
			//����Ĵ���������¼��ǰ�����key�������Ժ�clearAll
			var result = _getItem({key : _clearAllKey});
			if(result) {
				result = result.replace(new RegExp("(^|\\|)" + config.key + "(\\||$)",'g'),'');
				result = {
					key : _clearAllKey,
					value : result 
				};
				//�����
				__setItem(_clearAllKey,result);	
			}
			
		} catch (e) {
		}
	}
    
    //�Ƴ����еı�������
    function _clearAll(){
        result = _getItem({key : _clearAllKey});
        if(result) {
            var allKeys = result.split("|");
            var count = allKeys.length;
            for(var i = 0;i < count;i++){
                if(!!allKeys[i]) {
                    _removeItem({key:allKeys[i]});
                }
            }
        }
    }
    
    
    /**
     * ��ȡ���еı��ش洢���ݶ�Ӧ��key
     * @return {Array} ���е�key
     * @private 
     */
    function _getAllKeys(){
        var result = [];
        var keys = _getItem({key : _clearAllKey});
        if(keys) {
            keys = keys.split('|');
            for(var i = 0,len = keys.length;i < len;i++){
                if(!!keys[i]) {
                    result.push(keys[i]);
                }
            }
        }
        return result ;
    }
    
    /**
     * �жϵ�ǰ������Ƿ�֧�ֱ��ش洢��window.localStorage
     * @return {Boolean} true��֧�֣�false����֧��
     * @remark ֧�ֱ��ش洢���������IE8+��Firefox3.0+��Opera10.5+��Chrome4.0+��Safari4.0+��iPhone2.0+��Andrioid2.0+
     * @private
     */
    var _isSupportLocalStorage = (('localStorage' in window) && (window['localStorage'] !== null)),
        _isSupportUserData = !!jQuery.browser.ie;
    
    qext.LocalStorage = {
        /**
         * ���֧�ֱ��ش洢������true�����򷵻�false
         * @type Boolean
         */
        isAvailable : _isSupportLocalStorage || _isSupportUserData,
        
        /**
         * �����ݽ��б��ش洢��ֻ�ܴ洢�ַ�����Ϣ��
         * <pre><code>
		 * //���浥������
		 * qext.LocalStorage.set({
		 * 		key : "username",
		 * 		value : "baiduie",
		 * 		expires : 3600 * 1000
		 * });
		 * //����Ը�����
		 * qext.LocalStorage.set([{
		 * 		key : "username",
		 * 		value : "baiduie",
		 * 		expires : 3600 * 1000
		 * },{
		 * 		key : "password",
		 * 		value : "zxlie",
		 * 		expires : 3600 * 1000
		 * }]);
         * </code></pre>
         * @param {Object} obj ���洢����������ã������ǵ���JSON����Ҳ�������ɶ��JSON������ɵ�����
         * <ul>
         * <li><b>key</b> : String <div class="sub-desc">���洢���ݵ�key����ؽ�keyֵ��ĸ���һЩ���磺baidu.username</div></li>
         * <li><b>value</b> : String <div class="sub-desc">���洢���ݵ�����</div></li>
         * <li><b>expires</b> : String/Object (Optional)<div class="sub-desc">���ݵĹ���ʱ�䣬���������֣���λ�Ǻ��룻Ҳ���������ڶ��󣬱�ʾ����ʱ��</div></li>
         * </ul>
         */
        set : function(obj){
			//���浥������
			var _set_ = function(config){
				//keyУ��
				if(!_isValidKey(config.key)) {return;}

				//���洢������
				var storageInfo = config || {};
				
				//֧�ֱ��ش洢���������IE8+��Firefox3.0+��Opera10.5+��Chrome4.0+��Safari4.0+��iPhone2.0+��Andrioid2.0+
				if(_isSupportLocalStorage) {
					window.localStorage.setItem(storageInfo.key,storageInfo.value);
					if(config.expires) {
                        var expires;
                        //������������expiresΪ���֣����ʾ���ݵ��ܴ��ĺ�����
                        if ('number' == typeof storageInfo.expires) {
                            expires = new Date();
                            expires.setTime(expires.getTime() + storageInfo.expires);
                        }

                        window.localStorage.setItem(storageInfo.key + ".expires",expires);
					}
				} else if(_isSupportUserData) { //IE7�����°汾������UserData��ʽ
					_setItem(config.key,storageInfo);
				}	
			};

			//�жϴ���Ĳ����Ƿ�Ϊ����
			if(obj && obj.constructor === Array && obj instanceof Array){
				for(var i = 0,len = obj.length;i < len;i++){
					_set_(obj[i]);
				}
			}else if(obj){
				_set_(obj);
			}
        },
		
		/**
		 * ��ȡ���ش洢������
         * <pre><code>
		 * //��ȡĳһ�����ش洢������ֵΪ��{key:"",value:"",expires:""}��δȡ��ֵʱ����ֵΪ��null
		 * var rst = qext.LocalStorage.get({
		 * 		key : "username"
		 * });
		 * //��ȡ������ش洢������ֵΪ��["","",""]��δȡ��ֵʱ����ֵΪ��[null,null,null]
		 * qext.LocalStorage.get([{
		 * 		key : "username"
		 * },{
		 * 		key : "password"
		 * },{
		 * 		key : "sex"
		 * }]);
         * </code></pre>
		 * @param {String} obj ����ȡ�Ĵ洢����������ã�֧�ֵ��������룬ͬ��Ҳ֧�ֶ�������װ�������ʽ
		 * @config {String} key ���洢���ݵ�key
		 * @return {String} ���ش洢�����ݣ�����Ϊ��������ʱ�����ص������󣬻�ȡ����ʱ����null������Ϊ����ʱ������Ϊ����
		 */
        get : function(obj){
			//��ȡĳһ�����ش洢
			var _get_ = function(config){
				//���	
				var result = null;
				if(typeof config === "string") config = {key : config};
				//keyУ��
				if(!_isValidKey(config.key)) {return result;}
				
				//֧�ֱ��ش洢���������IE8+��Firefox3.0+��Opera10.5+��Chrome4.0+��Safari4.0+��iPhone2.0+��Andrioid2.0+
				if(_isSupportLocalStorage) {
					result = window.localStorage.getItem(config.key);
					//����ʱ���жϣ���������ˣ����Ƴ�����
					if(result) {
						var expires = window.localStorage.getItem(config.key + ".expires");
						result = {
							value : result,
							expires : expires ? new Date(expires) : null
						};
						if(result && result.expires && result.expires < new Date()) {
							result = null;
							window.localStorage.removeItem(config.key);
                            window.localStorage.removeItem(config.key + ".expires");
						}
					}
				} else if(_isSupportUserData) { //IE7�����°汾������UserData��ʽ
					//���ﲻ�õ����ж���expires����ΪUserData�����������ж�
					result = _getItem(config);
					if(result) {
						result = { value : result };
					}
				}
				
				return result ? result.value : null;
			};
			
			var rst = null;
			//�жϴ���Ĳ����Ƿ�Ϊ����
			if(obj && obj.constructor === Array && obj instanceof Array){
				rst = [];
				for(var i = 0,len = obj.length;i < len;i++){
					rst.push(_get_(obj[i]));
				}
			}else if(obj){
				rst = _get_(obj);
			}
			return rst;
        },
        
        /**
         * �Ƴ�ĳһ��ش洢������
         * <pre><code>
		 * //ɾ��һ�����ش洢��
		 * qext.LocalStorage.remove({
		 * 		key : "username"
		 * });
		 * //ɾ��������ش洢��Ŀ *
		 * qext.LocalStorage.remove([{
		 * 		key : "username"
		 * },{
		 * 		key : "password"
		 * },{
		 * 		key : "sex"
		 * }]);
         * </code></pre>
		 * @param {String} obj ���Ƴ��Ĵ洢����������ã�֧���Ƴ�ĳһ�����ش洢��Ҳ֧��������ʽ�������Ƴ�
		 * @config {String} key ���Ƴ����ݵ�key
		 * @return ��
         */
        remove : function(obj){
			//�Ƴ�ĳһ��ش洢������
			var _remove_ = function(config){
				//֧�ֱ��ش洢���������IE8+��Firefox3.0+��Opera10.5+��Chrome4.0+��Safari4.0+��iPhone2.0+��Andrioid2.0+
				if(_isSupportLocalStorage) {
					window.localStorage.removeItem(config.key);
					window.localStorage.removeItem(config.key + ".expires");
				} else if(_isSupportUserData){ //IE7�����°汾������UserData��ʽ
					_removeItem(config);
				}
			};
			
			//�жϴ���Ĳ����Ƿ�Ϊ����
			if(obj && obj.constructor === Array && obj instanceof Array){
				for(var i = 0,len = obj.length;i < len;i++){
					_remove_(obj[i]);
				}
			}else if(obj){
				_remove_(obj);
			}
        },
        
        /**
         * ������б��ش洢������
         * <pre><code>
         * qext.LocalStorage.clearAll();
         * </code></pre>
         */
        clearAll : function(){
            //֧�ֱ��ش洢���������IE8+��Firefox3.0+��Opera10.5+��Chrome4.0+��Safari4.0+��iPhone2.0+��Andrioid2.0+
            if(_isSupportLocalStorage) {
                window.localStorage.clear();
            } else if(_isSupportUserData) { //IE7�����°汾������UserData��ʽ
                _clearAll();
            }
        },
        
        //���浥�����󵽱���
        save:function(StudentID,ExamID,QuestionID,ExamAnswer){
        qext.LocalStorage.set({
           key : StudentID+ExamID+QuestionID,
           value : "{  StudentID��: ��"+StudentID+"��, ��ExamID��: ��"+ExamID+"��, ��QuestionID��: ��"+QuestionID+"��,��ExamAnswer��: ��"+ExamAnswer+"��}",
           expires : 3600 * 1000  /*��λ��ms*/
        });
        },
        /**
         * ��ȡ���еı��ش洢���ݶ�Ӧ��key
         * <pre><code>
         * var keys = qext.LocalStorage.getAllKeys();
         * </code></pre>
         * @return {Array} ���е�key
         */
        getAllKeys : function(){
            var result = [];
            //֧�ֱ��ش洢���������IE8+��Firefox3.0+��Opera10.5+��Chrome4.0+��Safari4.0+��iPhone2.0+��Andrioid2.0+
            if(_isSupportLocalStorage) {
                var key;
                for(var i = 0,len = window.localStorage.length;i < len;i++){
                    key = window.localStorage.key(i);
                    if(!/.+\.expires$/.test(key)) {
                        result.push(key);
                    }
                }
            } else if(_isSupportUserData) { //IE7�����°汾������UserData��ʽ
                result = _getAllKeys();
            }
            
            return result;
        }
    };

})();
