{strip}
	{if $browseMode == '1'}
		<div class="browse-list grid-item">
			<a href="{$summUrl}" {if !empty($openInNewWindow)}target="_blank"{/if} {if !empty($onclick)}onclick="{$onclick}" {/if}>
				<img class="img-responsive" src="{$bookCoverUrl}" alt="{$summTitle}" title="{$summTitle} by {$summAuthor}">
				<div><strong>{$summTitle}</strong></div>
			</a>
		</div>

	{else}{*Default Browse Mode (covers) *}
		<div class="browse-thumbnail grid-item {$coverStyle}">
			<a href="{$summUrl}" {if !empty($openInNewWindow)}target="_blank"{/if} {if !empty($onclick)}onclick="{$onclick}" {/if}>
				<div>
					<img src="{$bookCoverUrlMedium}" alt="{$summTitle}" title="{$summTitle}" class="{$coverStyle} browse-{$browseStyle} {if $browseCategoryRatingsMode != 0}ratings-on{/if}">
				</div>
			</a>
		{if !empty($showRatings) && $browseCategoryRatingsMode != 0}
			{*can't rate events but still want the spacing to match what we have for rated items*}
			<div class="browse-rating">
				<span class="ui-rater-starsOff" style="width:90px; visibility:hidden"></span>
			</div>
		{/if}
	{/if}
{/strip}