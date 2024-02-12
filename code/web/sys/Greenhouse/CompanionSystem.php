<?php

class CompanionSystem extends DataObject {
	public $__table = 'companion_system';
	protected $id;
	protected $serverName;
	protected $serverUrl;

	public static function getObjectStructure($context = ''): array {
		return [
			'id' => [
				'property' => 'id',
				'type' => 'label',
				'label' => 'Id',
				'description' => 'The unique id',
			],
			'serverName' => [
				'property' => 'serverName',
				'type' => 'text',
				'label' => 'Server Name',
				'description' => 'The internal server name for the companion system',
				'maxLength' => 72,
				'required' => true,
			],
			'serverUrl' => [
				'property' => 'serverUrl',
				'type' => 'text',
				'label' => 'Server URL',
				'description' => 'The URL to the companion system',
				'maxLength' => 255,
				'required' => true,
			],
		];
	}

	/**
	 * @return mixed
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * @param mixed $id
	 */
	public function setId($id): void {
		$this->id = $id;
	}

	/**
	 * @return mixed
	 */
	public function getServerName() {
		return $this->serverName;
	}

	/**
	 * @param mixed $serverName
	 */
	public function setServerName($serverName): void {
		$this->serverName = $serverName;
	}

	/**
	 * @return mixed
	 */
	public function getServerUrl() {
		return $this->serverUrl;
	}

	/**
	 * @param mixed $serverUrl
	 */
	public function setServerUrl($serverUrl): void {
		$this->serverUrl = $serverUrl;
	}
}