{strip}
	{* Added Breadcrumbs to appear above the format filter icons - JE 6/26/15 *}
	{if !empty($showBreadcrumbs)}
	<div class="row breadcrumbs">
		<div class="col-xs-12">
			<ul class="breadcrumb small">
				{if $useHomeLink == '1' || $useHomeLink == '3'}
					<li>
						<a href="{$homeLink}" id="homeLink" class="menu-icon menu-bar-option" title="{translate text="Return to $homeLinkText" inAttribute=true isPublicFacing=true}" aria-label="{translate text="Return to $homeLinkText" inAttribute=true isPublicFacing=true isAdminFacing=true}">
							<i class="fas fa-home"></i> {translate text=$homeLinkText isPublicFacing=true isAdminFacing=true}
						</a>
					</li>
				{/if}
				<li>
					{if $useHomeLink == '1' || $useHomeLink == '3'}
						<span class="divider">&raquo; </span>
					{/if}
					<a href="{if $useHomeLink == '0' || $useHomeLink == '2'}/{else}/Search/Home{/if}" id="browseLink" class="menu-icon menu-bar-option" title="{translate text='Browse the catalog' inAttribute=true isPublicFacing=true isAdminFacing=true}" aria-label="{translate text='Browse the catalog' inAttribute=true isPublicFacing=true isAdminFacing=true}">
						<i class="fas {if ($useHomeLink == '1' || $useHomeLink == '3') || ($showBookIcon == '1' && ($useHomeLink == '0' || $useHomeLink == '2'))}fa-book-open{else}fa-home{/if}"></i> {translate text=$browseLinkText isPublicFacing=true isAdminFacing=true}
					</a>
				</li>
				{* <li><a href="{$homeBreadcrumbLink}" id="home-breadcrumb"><i class="fas fa-home fa"></i> {translate text=$homeLinkText}</a></li> *}
				{if !empty($breadcrumbs)}
					{foreach from=$breadcrumbs item=breadcrumb}
						{if !empty($breadcrumb->label)}
							<li>
								<span class="divider">&raquo; </span>
								{if $breadcrumb->link}
									<a href="{$breadcrumb->link}">
								{/if}
								{if $breadcrumb->translate}
									{translate text=$breadcrumb->label isPublicFacing=true isAdminFacing=true}
								{else}
									{$breadcrumb->label}
								{/if}
								{if $breadcrumb->link}
									</a>
								{/if}
							</li>
						{/if}
					{/foreach}
				{/if}
			</ul>
		</div>
	</div>
	{/if}
{/strip}