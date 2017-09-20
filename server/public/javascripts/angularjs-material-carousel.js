(function (angular) {
    var app = angular.module('materialCarousel', []);

    app.directive('materialCarousel', ['$compile', function ($compile) {
        return {
            restrict: 'EA',
            scope: {
                materialCarouselSlides: '='
            },
            link: function (scope, element, attrs) {
                scope.slides = scope.materialCarouselSlides;
                scope.selectedTabSlider = 0;
                var html = '<md-tabs md-dynamic-height md-swipe-content md-center-tabs md-align-tabs="bottom" md-selected="selectedTabSlider" class="amc-slider-wrapper" ng-class="{ \'amc-hide-tabs-header amc-product-slider-wrapper-single-tab\' : slides.length === 1}"><md-tab ng-repeat="slide in slides"><md-tab-label><span class="amc-slider-tab-label">&bull;</span></md-tab-label><md-tab-body><div flex layout="column" layout-align="center center"><img ng-src="{{ slide.url }}" ng-attr-alt="{{ slide.caption ? slide.caption : \'Image\' }}" /></div><md-subheader class="amc-image-caption" ng-if="slide.caption">{{ slide.caption }}</md-subheader></md-tab-body></md-tab></md-tabs>';
                element.empty();
                element.append($compile(html)(scope));
            }
        };
	}]);

})(window.angular);
