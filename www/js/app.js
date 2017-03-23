// Ionic Starter App
// 'app' is the name of this angular module (also set in a <body> attribute in index.html)

angular.module('app', [
    'ionic', 'ngCordova','ngCordovaOauth','ngOpenFB', 'pascalprecht.translate','ionic-ratings',
    'app.controllers', 'app.filters', 'ionicLazyLoad','slickCarousel'	,'sw2.ionic.password-show-hide'
])
.constant('shopSettings',{           
    
})
.factory('PaypalService', ['$q', '$ionicPlatform', 'shopSettings', '$filter', '$timeout', function ($q, $ionicPlatform, shopSettings, $filter, $timeout) {
        var init_defer;
        /**
         * Service object
         * @type object
         */
        var service = {
            initPaymentUI: initPaymentUI,
            createPayment: createPayment,
            configuration: configuration,
            onPayPalMobileInit: onPayPalMobileInit,
            makePayment: makePayment
        };


        /**
         * @ngdoc method
         * @name initPaymentUI
         * @methodOf app.PaypalService
         * @description
         * Inits the payapl ui with certain envs. 
         *
         * 
         * @returns {object} Promise paypal ui init done
         */
        function initPaymentUI() {

            init_defer = $q.defer();
            $ionicPlatform.ready().then(function () {

                var clientIDs = {
                    "PayPalEnvironmentProduction": shopSettings.payPalProductionId,
                    "PayPalEnvironmentSandbox": shopSettings.payPalSandboxId
                };
				console.log(clientIDs);
                PayPalMobile.init(clientIDs, onPayPalMobileInit);
            });

            return init_defer.promise;

        }


        /**
         * @ngdoc method
         * @name createPayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Creates a paypal payment object 
         *
         * 
         * @returns {object} PayPalPaymentObject
         */
        function createPayment(total, name,currency,sale) {
                console.log("Total:"+total+"Name:"+name);
            // "Sale  == >  immediate payment
            // "Auth" for payment authorization only, to be captured separately at a later time.
            // "Order" for taking an order, with authorization and capture to be done separately at a later time.
            var payment = new PayPalPayment("" + total, ""+currency, "" + name, ""+sale);
            return payment;
        }
        /**
         * @ngdoc method
         * @name configuration
         * @methodOf app.PaypalService
         * @description
         * Helper to create a paypal configuration object
         *
         * 
         * @returns {object} PayPal configuration
         */
        function configuration() {
            // for more options see `paypal-mobile-js-helper.js`
			 console.log(shopSettings);
            var config = new PayPalConfiguration({merchantName: shopSettings.payPalShopName, merchantPrivacyPolicyURL: shopSettings.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: shopSettings.payPalMerchantUserAgreementURL});
            return config;
        }

        function onPayPalMobileInit() {
            $ionicPlatform.ready().then(function () {
                // must be called
				 console.log(shopSettings.payPalEnv);
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender(shopSettings.payPalEnv, configuration(), function () {

                    $timeout(function () {
                        init_defer.resolve();
                    });

                });
            });
        }

        /**
         * @ngdoc method
         * @name makePayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Performs a paypal single payment 
         *
         * 
         * @returns {object} Promise gets resolved on successful payment, rejected on error 
         */
        function makePayment(total, name,currency,sale) {



            var defer = $q.defer();
            total = $filter('number')(total, 2);
			 console.log(total);
            $ionicPlatform.ready().then(function () {
                PayPalMobile.renderSinglePaymentUI(createPayment(total, name,currency,sale), function (result) {
                    $timeout(function () {
                        defer.resolve(result);
                    });
                }, function (error) {
                    $timeout(function () {
                        defer.reject(error);
                    });
                });
            });

            return defer.promise;
        }

        return service;
    }])
        .service('User_data', function () {
            return {};
        })
 .factory('commonFunction', function() {
        return {
            foo: function() {
                alert("I'm foo!");
            },
            doDeletewishlist : function (p_id,idflag,$rootScope,$ionicPopup) {
				$rootScope.showLoading();
               
                 var u_id = getStorage('user_id');
                var params = {
                    user_id: u_id,
                    product_id: p_id
                };

                $rootScope.service.get('removeWishlist', params, function (res) {
                    $rootScope.hideLoading();

                    $rootScope.wishlist_detail = res.data.items;
                    angular.extend($rootScope.wishlist_detail, res.data.items);
                    if(idflag == 'big_wishlist_'){
                        $('.'+idflag+p_id).attr('src','img/icon-23.png');
                    }else{
                    $('.'+idflag+p_id).attr('src','img/save-25.png');
                    }
 $('.'+idflag+p_id).attr('rel','add');
                    return;
                });
            },
            doWhishlistAdd : function (p_id,idflag,$rootScope,$ionicPopup) {
            //var p_id = $('#product_w_id').val();            
            var u_id = getStorage('user_id');	
			if(u_id == null || u_id == ''){
				$ionicPopup.alert( 
				{
						title: 'error',
						subTitle: 'Login first',
						okType: 'buttonhk'
					}
				);		
			}else{
				var params = {
					product: p_id,
					user_id: u_id,
				};
				$rootScope.showLoading();
				$rootScope.service.get('addwishlist', params, function (res) {
					console.log(res);
					if (res.status == 'error') {
						$ionicPopup.alert( 
						{
								title: 'error',
								subTitle: res.message,
								okType: 'buttonhk'
							}
						);

						return;
					}
					if (res.status == 'success' || res.status == 'SUCCESS') {
						$rootScope.hideLoading();
                                            if(idflag == 'big_wishlist_'){
                                                $('.'+idflag+p_id).attr('src','img/icon-28.png');
                                            }else{
                                            $('.'+idflag+p_id).attr('src','img/icon-25.png');
                                            }

                                        
                                        $('.'+idflag+p_id).attr('rel','remove');
						return;
					}
			
            	});           
			}
        }
        };
    })        
        .run(function ($ionicPlatform,$rootScope,$ionicPopup,$cordovaSocialSharing, $http, $ionicPopup,$ionicLoading,ngFB,commonFunction) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default
                /*if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }*/
                $rootScope.showLoading = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="spiral"></ion-spinner>'
                });
             };
            $rootScope.hideLoading = function () {
                $ionicLoading.hide();
            };
                 $rootScope.toggleWishlish = function (p_id,idflag) {
                     console.log(p_id);
                  var typeWish=$('.'+idflag+p_id).attr('rel');
                  console.log(typeWish);
                  if(typeWish=='remove'){
                        commonFunction.doDeletewishlist(p_id,idflag,$rootScope,$ionicPopup);
                  }else{
                       commonFunction.doWhishlistAdd(p_id,idflag,$rootScope,$ionicPopup);
                  }
                 };
                $rootScope.sharewithfriend = function () {
                    $rootScope.showLoading();
                    var message = "Ebranch App";
                    $cordovaSocialSharing.share(message, null, null);
                    $rootScope.hideLoading();
                };
                 
                ngFB.init({appId: '419763941691558'});
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
            
            Service($rootScope, $http, $ionicPopup);
        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider) {
            $ionicConfigProvider.backButton.text('Back').icon('ion-chevron-left');
            $ionicConfigProvider.scrolling.jsScrolling(false);
            $ionicConfigProvider.tabs.position('bottom');
            $ionicConfigProvider.form.checkbox('square');
            $ionicConfigProvider.views.transition('none');  //('fade-in')

            $stateProvider
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('app.home', {
                        cache: false,
                        url: '/home', //首页
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/home.html',
                                controller: 'HomeCtrl'
                            }
                        }
                    })
                    .state('app.searchResult', {
                        url: '/searchResult',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/searchResult.html',
                                controller: 'SearchResultCtrl'
                            }
                        }
                    })

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/home');

$translateProvider.translations('ar_SA', ar_SA);
        $translateProvider.translations('en_US', en_US);
  if(Config.getLocale()=='arabic'){
         $translateProvider.preferredLanguage('ar_SA');
  }else {
    $translateProvider.preferredLanguage('en_US');
  }
        })

        .directive('onFinishRender', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function () {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            }

        });

window.onerror = function (e, file, line) {
    if (!Config.debug) {
        return;
    }
    alert([e, file, line].join(', '));
};


function setStorage(key, value) {
    localStorage.setItem(key, value);
}

function getStorage(key) {
    return localStorage.getItem(key);
}

function removeStorage(key) {
    localStorage.removeItem(key);
}

function explode(sep, string) {
    var res = string.split(sep);
    return res;
}

function urlencode(data) {
    return encodeURIComponent(data);
}



window.onload = function(){
 if ( Config.getLocale()=='arabic') {
	 document.getElementById('lang_css').href = 'css/lang_sa.css';
 }
}